<template>
    <div
        class="message relative"
        :class="{
            error,
            success,
            warning,
        }"
    >
        <button
            v-if="closable"
            class="absolute top-2 right-3 cursor-pointer"
            @click="$emit('close')"
        >
            <i class="pi pi-times" />
        </button>
        <slot>
            {{ message }}
        </slot>
    </div>
</template>

<script setup lang="ts">
import 'primeicons/primeicons.css'

type Props = {
    message?: string
    error?: boolean
    success?: boolean
    warning?: boolean
    closable?: boolean
}

defineProps<Props>()

defineEmits(['close'])
</script>

<style lang="scss" scoped>
.message {
    @apply p-8 border border-solid rounded;
    @apply bg-blue-200 border-blue-400;
    @apply text-center;

    &.success {
        @apply bg-green-200 border-green-400;
    }

    &.error {
        @apply bg-red-200 border-red-400;
    }

    &.warning {
        @apply bg-orange-200 border-orange-400;
    }
}
</style>
