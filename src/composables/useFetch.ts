import { ref } from "vue";
import {
    AuthLogin,
    CreateUser,
    ResponseLogin,
    ResponseUser,
    CreateResourcePool,
    ResponseResourcePool,
    CreateACL,
    ResponseACL,
    CreateProject,
    ResponseProject,
    ResponseError,
} from "../types";

const baseUrl = "http://192.168.180.81:3080";

function getCookie(cname: string) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}

export function useFetch() {
    const authToken = ref<string | null>(getCookie("access_token"));

    type FetchResponse = [any, any, number | null];

    const myFetch = async (
        url: string,
        data:
            | CreateUser
            | AuthLogin
            | CreateACL
            | CreateProject
            | CreateResourcePool
            | null = null,
        options: RequestInit = {},
        autoParseJson = true
    ): Promise<FetchResponse> => {
        try {
            const response = await fetch(baseUrl + url, {
                headers: {
                    Authorization: `Bearer ${authToken.value}`,
                    "Content-Type": "application/json",
                    accept: "application/json",
                },
                method: "POST",
                ...options,
                body: data ? JSON.stringify(data) : options?.body,
            });

            if (!autoParseJson) {
                return [await response.text(), null, response.status];
            }

            const responseData = await response.json();

            return [responseData, null, response.status];
        } catch (error) {
            return [null, error, null];
        }
    };

    async function login(
        user: string,
        password: string
    ): Promise<[ResponseLogin | null, ResponseError | null]> {
        const url = "/v3/access/users/authenticate";

        const [data, error, status] = await myFetch(
            url,
            {
                username: user,
                password: password,
            },
            {
                // overwrite auth header for this request
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (error) {
            return [null, error];
        }

        if (status !== 200) {
            return [null, data as ResponseError];
        }

        const expires = new Date();
        expires.setTime(expires.getTime() + 12 * 60 * 60 * 1000); // 12 hours
        document.cookie = `access_token=${
            data.access_token
        }; expires=${expires.toUTCString()}; path=/`;
        authToken.value = data.access_token;

        return [data, null];
    }

    function logout(): void {
        document.cookie =
            "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        window.location.reload();
    }

    async function createUser(
        user: CreateUser
    ): Promise<[ResponseUser | null, ResponseError | null]> {
        const url = "/v3/access/users";

        const [data, error, status] = await myFetch(url, user);

        if (error) return [null, error];

        if (status !== 201) {
            return [
                null,
                {
                    message: data.message,
                },
            ];
        }

        data.password = user.password;

        return [data, null];
    }

    async function createUserACL(
        user: ResponseUser,
        resourcePool: ResponseResourcePool
    ): Promise<[ResponseACL | null, ResponseError | null]> {
        const STUDENT_ROLE_ID = "c5388cb0-3643-4a82-b4ea-b157fc292bbb";
        const url = "/v3/access/acl";

        const [data, error, status] = await myFetch(url, {
            user_id: user.user_id,
            role_id: STUDENT_ROLE_ID,
            group_id: null,
            ace_type: "user",
            allowed: true,
            path: "/pools/" + resourcePool.resource_pool_id,
            propagate: true,
        });

        if (error) return [null, error];

        if (status !== 201) {
            return [
                null,
                {
                    message: data.message,
                },
            ];
        }

        return [data, null];
    }

    async function createProject(
        project: CreateProject
    ): Promise<[ResponseProject | null, ResponseError | null]> {
        const url = "/v3/projects";

        const [data, error, status] = await myFetch(url, project);

        if (error) {
            return [null, error];
        }

        if (status !== 200 && status !== 201) {
            return [null, data];
        }

        return [data, null];
    }

    async function createResourcePool(
        resourcePool: CreateResourcePool
    ): Promise<[ResponseResourcePool | null, ResponseError | null]> {
        const url = "/v3/pools";

        const [data, error, status] = await myFetch(url, resourcePool);

        if (error) return [null, error];

        if (status !== 201) {
            return [
                null,
                {
                    message: data.message,
                },
            ];
        }

        return [data, null];
    }

    async function linkProjectToResourcePool(
        projectId: string,
        resourcePoolId: string
    ): Promise<boolean> {
        const url = `/v3/pools/${resourcePoolId}/resources/${projectId}`;

        const [_data, error] = await myFetch(
            url,
            null,
            {
                method: "PUT",
            },
            false
        );

        return !error;
    }

    return {
        authToken,
        createUser,
        login,
        logout,
        createResourcePool,
        createProject,
        createUserACL,
        linkProjectToResourcePool,
    };
}
