<template>
    <div class="text-white">
        <div class="flex justify-between gap-3 my-3">
            <div class="flex gap-3" v-if="activeData.length > 0">
                <button @click="clearTable" class="button--failed">
                    Clear Table
                </button>

                <button @click="store.downloadCSV" class="button--primary">
                    Download CSV
                </button>
            </div>

            <button @click="logout" class="button--failed">Logout</button>
        </div>

        <div
            v-if="!automatedProcessing"
            class="flex gap-3 my-3 mt-8 overflow-x-scroll lg:overflow-x-auto whitespace-nowrap"
        >
            <button @click="toggleAll" class="button--secondary">
                {{
                    selectedRows.length === activeData.length
                        ? "Deselect all"
                        : "Select all"
                }}
            </button>

            <ActionButton
                @click="executeAllForSelectedUsers"
                :disabled="selectedRows.length === 0"
            >
                All for {{ selectedRows.length }} rows
            </ActionButton>

            <ActionButton
                @click="executeForSelectedUsers(store.actions.debug.forAll)"
                :disabled="selectedRows.length === 0"
            >
                Debug
            </ActionButton>

            <ActionButton
                @click="
                    executeForSelectedUsers(store.actions.createUser.forAll)
                "
                :disabled="selectedRows.length === 0"
            >
                Create User
            </ActionButton>

            <ActionButton
                @click="
                    executeForSelectedUsers(
                        store.actions.createResourcePool.forAll
                    )
                "
                :disabled="selectedRows.length === 0"
            >
                Resource Pool
            </ActionButton>

            <ActionButton
                @click="executeForSelectedUsers(store.actions.createACL.forAll)"
                :disabled="selectedRows.length === 0"
            >
                Create ACL
            </ActionButton>

            <ActionButton
                @click="
                    executeForSelectedUsers(store.actions.createProjects.forAll)
                "
                :disabled="selectedRows.length === 0"
            >
                Create Projects
            </ActionButton>
        </div>

        <div v-else class="flex gap-3 my-3 mt-8">
            <h1 class="my-auto text-2xl font-bold text-white">
                Doing actions...
            </h1>
            <button
                class="flex items-center gap-2 button--failed"
                @click="stopAutomatedProcessing = true"
                :disabled="stopAutomatedProcessing"
            >
                <span>STOP{{ stopAutomatedProcessing ? "PING" : "" }}</span>
                <LoaderCircle
                    v-if="stopAutomatedProcessing"
                    class="animate-spin"
                />
            </button>
        </div>

        <div class="relative">
            <div class="overflow-x-scroll rounded-lg">
                <table
                    class="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400"
                >
                    <thead
                        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
                    >
                        <tr>
                            <th scope="col" class="px-6 py-3">
                                {{ selectedRows.length }}/{{
                                    activeData.length
                                }}
                                ausgewählt
                            </th>
                            <th scope="col" class="px-6 py-3">Zeile</th>
                            <th scope="col" class="px-6 py-3">Name</th>
                            <th scope="col" class="px-6 py-3">Telefon</th>
                            <th scope="col" class="px-6 py-3">
                                Office365 Mailadresse
                            </th>
                            <th scope="col" class="px-6 py-3">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="user of activeData"
                            :key="user.id"
                            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                        >
                            <td
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                            >
                                <Checkbox
                                    :id="user.id.toString()"
                                    :label="''"
                                    :default-value="
                                        selectedRows.includes(user.id)
                                    "
                                    @update:off="() => remove(user.id)"
                                    @update:on="() => select(user.id)"
                                />
                            </td>

                            <td class="px-6 py-4">
                                {{ user.id }}
                            </td>
                            <td class="px-6 py-4">{{ user.name }}</td>
                            <td class="px-6 py-4">{{ user.telephone }}</td>
                            <td class="px-6 py-4">{{ user.schoolMail }}</td>
                            <td
                                class="flex w-full gap-2 px-6 py-4 whitespace-nowrap"
                            >
                                <ActionButton
                                    @click="store.actions.debug.action(user)"
                                    :disabled="
                                        !!user.actions.debug.result ||
                                        user.schoolMail.length === 0
                                    "
                                    :success="
                                        user.actions.debug.result?.message
                                    "
                                    :error="user.actions.debug.error"
                                    :loading="user.actions.debug.isLoading"
                                >
                                    Debug
                                </ActionButton>

                                <ActionButton
                                    @click="
                                        store.actions.createUser.action(user)
                                    "
                                    :disabled="
                                        user.actions.createUser.result !==
                                            null ||
                                        user.actions.debug.result === null
                                    "
                                    :success="
                                        user.actions.createUser.result
                                            ? `User created with id ${user.actions.createUser.result.user_id}`
                                            : null
                                    "
                                    :error="user.actions.createUser.error"
                                    :loading="user.actions.createUser.isLoading"
                                >
                                    Create User
                                </ActionButton>

                                <ActionButton
                                    @click="
                                        store.actions.createResourcePool.action(
                                            user
                                        )
                                    "
                                    :disabled="
                                        user.actions.createRP.result !== null ||
                                        user.actions.createUser.result === null
                                    "
                                    :success="
                                        user.actions.createRP.result
                                            ? `Resource Pool created with id ${user.actions.createRP.result.resource_pool_id}`
                                            : null
                                    "
                                    :error="user.actions.createRP.error"
                                    :loading="user.actions.createRP.isLoading"
                                >
                                    Resource Pool
                                </ActionButton>

                                <ActionButton
                                    @click="
                                        store.actions.createACL.action(user)
                                    "
                                    :disabled="
                                        user.actions.createACL.result !==
                                            null ||
                                        user.actions.createRP.result === null
                                    "
                                    :success="
                                        user.actions.createACL.result
                                            ? `ACL created with id ${user.actions.createACL.result?.ace_id}`
                                            : null
                                    "
                                    :error="user.actions.createACL.error"
                                    :loading="user.actions.createACL.isLoading"
                                >
                                    Create ACL
                                </ActionButton>

                                <ActionButton
                                    @click="
                                        store.actions.createProjects.action(
                                            user
                                        )
                                    "
                                    :disabled="
                                        user.actions.createProjects.result !==
                                            null ||
                                        user.actions.createACL.result === null
                                    "
                                    :success="
                                        user.actions.createProjects.result
                                            ? `Projects created with names ${user.actions.createProjects.result
                                                  .map(
                                                      (project) => project.name
                                                  )
                                                  .join(', ')}`
                                            : null
                                    "
                                    :error="user.actions.createProjects.error"
                                    :loading="
                                        user.actions.createProjects.isLoading
                                    "
                                >
                                    Create Projects
                                </ActionButton>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useImportStore } from "../store/useImport";
import Checkbox from "./Checkbox.vue";
import { ref } from "vue";
import { useFetch } from "../composables/useFetch";
import ActionButton from "./ActionButton.vue";
import { ActiveUser } from "../types";
import { LoaderCircle } from "lucide-vue-next";

const store = useImportStore();
const { activeData } = storeToRefs(store);
const selectedRows = ref<number[]>([]);
const { logout } = useFetch();

const automatedProcessing = ref(false);
const stopAutomatedProcessing = ref(false);

const executeForSelectedUsers = async (data: {
    action: (user: ActiveUser) => Promise<void>;
    check: (user: ActiveUser) => Boolean;
}) => {
    automatedProcessing.value = true;

    for (const id of selectedRows.value) {
        const user = activeData.value.find((user) => user.id === id);
        if (user && data.check(user)) {
            console.log("action", user);
            await data.action(user);
        }

        if (checkForCancel()) {
            return;
        }
    }

    automatedProcessing.value = false;
};

const checkForCancel = (): Boolean => {
    if (stopAutomatedProcessing.value) {
        automatedProcessing.value = false;
        stopAutomatedProcessing.value = false;

        return true;
    }

    return false;
};

const executeAllForSelectedUsers = async () => {
    automatedProcessing.value = true;

    for (const id of selectedRows.value) {
        const user = activeData.value.find((user) => user.id === id);

        if (user) {
            if (checkForCancel()) {
                return;
            }

            if (store.actions.debug.forAll.check(user)) {
                await store.actions.debug.forAll.action(user);
            }

            if (checkForCancel()) {
                return;
            }

            if (store.actions.createUser.forAll.check(user)) {
                await store.actions.createUser.forAll.action(user);
            }

            if (checkForCancel()) {
                return;
            }

            if (store.actions.createResourcePool.forAll.check(user)) {
                await store.actions.createResourcePool.forAll.action(user);
            }

            if (checkForCancel()) {
                return;
            }

            if (store.actions.createACL.forAll.check(user)) {
                await store.actions.createACL.forAll.action(user);
            }

            if (checkForCancel()) {
                return;
            }

            if (store.actions.createProjects.forAll.check(user)) {
                await store.actions.createProjects.forAll.action(user);
            }

            if (checkForCancel()) {
                return;
            }
        }
    }

    automatedProcessing.value = false;
};

const select = (id: number) => {
    if (selectedRows.value.includes(id)) {
        selectedRows.value = selectedRows.value.filter((row) => row !== id);
    } else {
        selectedRows.value = [...selectedRows.value, id];
    }
};

const remove = (id: number) => {
    selectedRows.value = selectedRows.value.filter((row) => row !== id);
};

const toggleAll = () => {
    if (selectedRows.value.length === activeData.value.length) {
        selectedRows.value = [];
    } else {
        selectedRows.value = activeData.value.map((user) => user.id);
    }
};

const clearTable = () => {
    if (confirm("Are you sure to delete all users locally?")) {
        store.clearData();
    }
};
</script>
