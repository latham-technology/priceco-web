<template>
    <div class="input-row">
        <slot />
    </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.input-row {
    @apply w-full py-2;
    @apply flex gap-4 flex-wrap;

    & :deep() {
        > * {
            @apply flex-1;
        }
    }
}
</style>
