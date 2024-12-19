<script setup lang="ts">
import { ref, onMounted } from "vue";
import Upload from "./components/Upload.vue";
import UserTable from "./components/UserTable.vue";
import { useFetch } from "./composables/useFetch";
import { Info } from "lucide-vue-next";
import { initFlowbite } from "flowbite";
import { useImportStore } from "./store/useImport";
import { storeToRefs } from "pinia";

const { authToken, login } = useFetch();
const store = useImportStore();
const loginError = ref("");

const username = ref("");
const password = ref("");

const { activeData } = storeToRefs(store);

async function submit(event: Event) {
    event.preventDefault();

    loginError.value = "";

    const [_data, error] = await login(username.value, password.value);

    if (error) {
        loginError.value = error.message;
        return;
    }
}

onMounted(() => {
    initFlowbite();
});
</script>

<template>
    <div class="p-6">
        <div v-if="!authToken">
            <div
                class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
                role="alert"
            >
                <Info class="me-2" />
                <span class="sr-only">Info</span>
                <div>
                    <span class="font-medium">Authentication failed.</span>
                    Please login to continue.
                </div>
            </div>

            <form class="max-w-sm mx-auto mt-44">
                <div class="mb-5">
                    <label
                        for="username"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Username</label
                    >
                    <input
                        type="text"
                        id="username"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="john"
                        v-model="username"
                        required
                    />
                </div>
                <div class="mb-5">
                    <label
                        for="password"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >Password</label
                    >
                    <input
                        type="password"
                        id="password"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                        v-model="password"
                    />
                </div>

                <div
                    v-if="loginError"
                    class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
                    role="alert"
                >
                    <Info class="me-2" />
                    <span class="sr-only">Info</span>
                    <div>
                        <span class="font-medium">Login failed.</span>
                        {{ loginError }}
                    </div>
                </div>

                <button
                    @click="submit"
                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    Login
                </button>
            </form>
        </div>
        <template v-else>
            <div
                class="w-full md:w-1/2 lg:w-1/3"
                v-if="activeData.length === 0"
            >
                <Upload />
            </div>
            <UserTable />
        </template>
    </div>
</template>
