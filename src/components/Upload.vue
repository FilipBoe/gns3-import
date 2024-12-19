<template>
    <div>
        <FilePond
            :accepted-file-types="['application/csv', 'text/csv']"
            :instant-upload="false"
            :drag-on-page="true"
            credits=""
            @addfile="process"
        />

        <div
            v-if="importedRows.length"
            class="px-4 py-3 my-4 text-teal-900 bg-teal-100 border-t-4 border-teal-500 rounded-lg shadow-md animate-[wiggle_1s_ease-in-out_infinite]"
            role="alert"
        >
            <div class="flex">
                <div class="py-1">
                    <svg
                        class="w-6 h-6 mr-4 text-teal-500 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                    >
                        <path
                            d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"
                        />
                    </svg>
                </div>
                <div>
                    <p class="font-bold">Imported successfully</p>
                    <p class="text-sm">
                        Imported {{ importedRows.length }} rows from the file.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import vueFilePond from "vue-filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond/dist/filepond.min.css";
import { useImportStore } from "../store/useImport";
import { FilePondFile } from "filepond";
import { storeToRefs } from "pinia";

const FilePond = vueFilePond(FilePondPluginFileValidateType);
const importStore = useImportStore();
const { importedRows } = storeToRefs(importStore);

const process = (_error: string, file: FilePondFile) => {
    importStore.processFile(file.file as File);
};
</script>
