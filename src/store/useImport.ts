import { defineStore } from "pinia";
import { nextTick, ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { useFetch } from "../composables/useFetch";
import {
    ActiveUser,
    CreateProject,
    CreateResourcePool,
    CreateUser,
    ImportRow,
} from "../types";
import { initFlowbite } from "flowbite";

const wantedFormat = {
    "Eigene Mailadresse": "privateMail",
    Nachname: "lastName",
    Name: "name",
    "Office365 Mailadresse": "schoolMail",
    Stundentafel: "timetable",
    Telefon: "telephone",
    Vorname: "firstName",
    Zeile: "id",
};

export const useImportStore = defineStore("import", () => {
    const importedRows = ref<ImportRow[]>([]);
    const activeData = useLocalStorage<ActiveUser[]>("activeData", []);

    const {
        createUser,
        createUserACL,
        createResourcePool,
        createProject,
        linkProjectToResourcePool,
    } = useFetch();

    const actions = {
        debug: {
            title: "Debug",
            key: "debug",
            action: async (data: ActiveUser) => {
                data.actions.debug.error = null;
                data.actions.debug.result = null;
                data.actions.debug.isLoading = true;

                await new Promise((resolve) => setTimeout(resolve, 1500));

                const failOrSucceed = true;

                data.actions.debug.isLoading = false;

                if (!failOrSucceed) {
                    data.actions.debug.error = "Debug action failed";
                    return;
                }

                data.actions.debug.result = {
                    message: "Debug action successful",
                };
            },
            forAll: {
                action: async (user: ActiveUser) =>
                    await actions.debug.action(user),
                check: (user: ActiveUser) => !user.actions.debug.result,
            },
        },
        createResourcePool: {
            title: "Create Resourcepool",
            action: async (data: ActiveUser) => {
                data.actions.createRP.error = null;
                data.actions.createRP.result = null;

                if (!data.actions.createUser.result) {
                    data.actions.createACL.error = "User not created yet";
                    return;
                }

                data.actions.createRP.isLoading = true;

                const pool: CreateResourcePool = {
                    name: data.name,
                };

                const [resourcePool, error] = await createResourcePool(pool);

                data.actions.createRP.isLoading = false;

                if (error) {
                    data.actions.createRP.error = error.message;
                    return;
                }

                data.actions.createRP.result = resourcePool;
            },
            forAll: {
                action: async (user: ActiveUser) =>
                    await actions.createResourcePool.action(user),
                check: (user: ActiveUser) =>
                    !user.actions.createRP.result &&
                    !!user.actions.createUser.result,
            },
        },
        createUser: {
            title: "Create user",
            action: async (data: ActiveUser) => {
                data.actions.createUser.error = null;
                data.actions.createUser.result = null;
                data.actions.createUser.isLoading = true;

                const username = data.firstName + "." + data.lastName;

                const user: CreateUser = {
                    email: data.schoolMail,
                    full_name: data.name,
                    is_active: true,
                    password: Math.random().toString(36).substring(2, 8),
                    username,
                };

                const [createdUser, error] = await createUser(user);

                data.actions.createUser.isLoading = false;

                if (error || !createdUser) {
                    data.actions.createUser.error =
                        error?.message ?? "User not created";
                    return;
                }

                data.actions.createUser.result = createdUser;
            },
            forAll: {
                action: async (user: ActiveUser) =>
                    await actions.createUser.action(user),
                check: (user: ActiveUser) =>
                    !user.actions.createUser.result &&
                    !!user.actions.debug.result,
            },
        },
        createACL: {
            title: "Create ACL for user",
            action: async (data: ActiveUser) => {
                data.actions.createACL.result = null;
                data.actions.createACL.error = null;

                if (
                    !data.actions.createUser.result ||
                    !data.actions.createRP.result
                ) {
                    data.actions.createACL.error = "User or RP not created yet";
                    return;
                }

                data.actions.createACL.isLoading = true;

                const [response, error] = await createUserACL(
                    data.actions.createUser.result,
                    data.actions.createRP.result
                );

                data.actions.createACL.isLoading = false;

                if (error) {
                    data.actions.createACL.error = error.message;
                    return;
                }

                data.actions.createACL.result = response;
            },
            forAll: {
                action: async (user: ActiveUser) =>
                    await actions.createACL.action(user),
                check: (user: ActiveUser) =>
                    !user.actions.createACL.result &&
                    !!user.actions.createRP.result,
            },
        },
        createProjects: {
            title: "Create 10 Projects",
            action: async (data: ActiveUser) => {
                data.actions.createProjects.error = null;
                data.actions.createProjects.result = null;

                if (
                    !data.actions.createUser.result ||
                    !data.actions.createRP.result
                ) {
                    data.actions.createProjects.error =
                        "User or RP not created yet";
                    return;
                }

                data.actions.createProjects.isLoading = true;

                const projectLayout: CreateProject = {
                    name: "",
                    auto_close: true,
                    auto_open: false,
                    auto_start: false,
                    scene_height: 1000,
                    scene_width: 2000,
                    zoom: 100,
                    show_layers: false,
                    snap_to_grid: false,
                    show_grid: false,
                    grid_size: 75,
                    drawing_grid_size: 25,
                    show_interface_labels: false,
                    supplier: null,
                    variables: null,
                    status: "opened",
                };

                for (let i = 1; i <= 10; i++) {
                    projectLayout.name = `${data.lastName}_${data.firstName}_Project${i}`;

                    const [projectResponse, projectError] = await createProject(
                        projectLayout
                    );

                    if (projectError || !projectResponse) {
                        data.actions.createProjects.error =
                            projectError?.message ?? "Project not created";

                        data.actions.createProjects.isLoading = false;

                        return;
                    }

                    const didLink = await linkProjectToResourcePool(
                        projectResponse.project_id,
                        data.actions.createRP.result.resource_pool_id
                    );

                    if (!didLink) {
                        data.actions.createProjects.error = `Project ${projectLayout.name} not linked`;
                        data.actions.createProjects.isLoading = false;

                        return;
                    }

                    if (!data.actions.createProjects.result) {
                        data.actions.createProjects.result = [];
                    }

                    data.actions.createProjects.result.push(projectResponse);

                    // wait 500ms between projects to not overload the server
                    await new Promise((resolve) => setTimeout(resolve, 500));
                }

                data.actions.createProjects.isLoading = false;
            },
            forAll: {
                action: async (user: ActiveUser) =>
                    await actions.createProjects.action(user),
                check: (user: ActiveUser) =>
                    !user.actions.createProjects.result &&
                    !!user.actions.createACL.result,
            },
        },
    };

    function processFile(file: File) {
        const reader = new FileReader();

        reader.onload = (e) => {
            let content = e.target?.result as string;

            content = content.replaceAll('"', "");

            const ofComas = content.match(/,/g)?.length ?? 0;
            const ofSemicolons = content.match(/;/g)?.length ?? 0;

            const splitSymbol = ofComas > ofSemicolons ? "," : ";";

            const rows: string[] = content.split("\n").filter((row) => row);

            // check if format matches
            const headerRow = rows[0].replace("\r", "").split(splitSymbol);

            if (
                !Object.keys(wantedFormat).every((header) =>
                    headerRow.includes(header)
                )
            ) {
                console.error("Invalid file format");
                throw new Error("Invalid file format");
            }

            // laod data into correct format
            const data = rows.slice(1).map((row) => {
                const rawArrayValues = row.replace("\r", "").split(splitSymbol);

                const rawFormat = Object.fromEntries(
                    headerRow.map((key, index) => [key, rawArrayValues[index]])
                );

                const rowValues = Object.fromEntries(
                    Object.entries(wantedFormat).map(([key, value]) => [
                        value,
                        rawFormat[key],
                    ])
                );

                return {
                    ...rowValues,
                    id: parseInt(rowValues.id),
                    timetable: parseInt(rowValues.timetable),
                };
            });

            importedRows.value = data as ImportRow[];

            activeData.value = data.map((row) => ({
                ...row,
                actions: {
                    debug: {
                        error: null,
                        result: null,
                        isLoading: false,
                    },
                    createUser: {
                        error: null,
                        result: null,
                        isLoading: false,
                    },
                    createACL: {
                        error: null,
                        result: null,
                        isLoading: false,
                    },
                    createProjects: {
                        error: null,
                        result: null,
                        isLoading: false,
                    },
                    createRP: {
                        error: null,
                        result: null,
                        isLoading: false,
                    },
                },
                importedAt: new Date(),
            })) as unknown as ActiveUser[];

            setTimeout(() => {
                importedRows.value = [];
            }, 7000);

            nextTick(() => {
                // initialize popovers
                initFlowbite();
            });
        };
        reader.readAsText(file);
    }

    function downloadCSV() {
        const csvContent = `data:text/csv;charset=utf-8,${[
            "Zeile,Nachname,Vorname,Name,Telefon,Eigene Mailadresse,Office365 Mailadresse,Stundentafel,Passwort",
            ...activeData.value.map((row) =>
                [
                    row.id,
                    row.lastName,
                    row.firstName,
                    row.name,
                    row.telephone,
                    row.privateMail,
                    row.schoolMail,
                    row.timetable,
                    row.actions.createUser.result?.password ?? "not created",
                ].join(",")
            ),
        ].join("\n")}`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "export.csv");
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    }

    function clearData() {
        importedRows.value = [];
        activeData.value = [];
    }

    return {
        importedRows,
        activeData,
        processFile,
        actions,
        clearData,
        downloadCSV,
    };
});
