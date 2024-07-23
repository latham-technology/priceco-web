<template>
    <Transition>
        <slot />
    </Transition>
</template>

<script setup></script>

<style lang="scss" scoped>
.v-enter-active,
.v-leave-active {
    @apply transition-opacity;
}

.v-enter-from,
.v-leave-to {
    @apply opacity-0;
}

.v-enter-to,
.v-leave-from {
    @apply opacity-100;
}
</style>
