<template>
    <button
        :id="id"
        @click="$emit('click')"
        class="flex justify-around button--primary"
        :class="{
            'button--disabled': disabled || loading,
            'button--failed': error,
            'button--success': success,
        }"
        :disabled="disabled || loading"
        :data-popover-target="`popover-${id}`"
    >
        <template v-if="success">
            <span class="p-0.5 my-auto me-1.5 bg-green-600 rounded-full"
                ><Check :size="16" />
            </span>
        </template>
        <template v-if="error">
            <span class="p-0.5 my-auto me-1 bg-red-800 rounded-full"
                ><Frown :size="16" />
            </span>
        </template>
        <template v-if="loading">
            <span class="p-0.5 my-auto me-1 rounded-full"
                ><LoaderCircle :size="16" class="animate-spin" />
            </span>
        </template>
        <slot></slot>
    </button>

    <div
        data-popover
        :id="`popover-${id}`"
        role="tooltip"
        class="absolute z-50 invisible inline-block w-64 text-sm text-gray-500 whitespace-normal transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800"
        :class="!error && !success ? '!invisible' : ''"
    >
        <div
            class="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700"
        >
            <h3 class="font-semibold text-gray-900 dark:text-white">
                {{ error ? "Error" : "Success" }}
            </h3>
        </div>
        <div class="px-3 py-2">
            <p>{{ error || success }}</p>
        </div>
        <div data-popper-arrow></div>
    </div>
</template>

<script setup lang="ts">
import { Check, Frown, LoaderCircle } from "lucide-vue-next";

defineProps({
    id: {
        type: String,
        default: () => Math.random().toString(36).substring(7),
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    error: {
        type: [String, null],
        default: null,
    },
    success: {
        type: [String, null],
        default: null,
    },
    loading: {
        type: Boolean,
        default: false,
    },
});

defineEmits(["click"]);
</script>
