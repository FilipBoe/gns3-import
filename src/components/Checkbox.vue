<template>
    <div class="flex items-center mb-4">
        <input
            :id="id"
            type="checkbox"
            :checked="defaultValue"
            @input="handleInput"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label
            :for="id"
            class="text-sm font-medium text-gray-900 ms-2 dark:text-gray-300"
            >{{ label }}</label
        >
    </div>
</template>

<script setup lang="ts">
defineProps({
    id: {
        type: String,
        default: Math.random(),
    },
    label: {
        type: String,
        required: true,
    },
    defaultValue: {
        type: Boolean,
        default: false,
    },
});

const emits = defineEmits(["update:on", "update:off"]);

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;

    if (target.checked) {
        emits("update:on");
    } else {
        emits("update:off");
    }
};
</script>
