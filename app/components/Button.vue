<template>
    <button class="button" :type="type" v-bind="$attrs">
        <slot />
    </button>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        type?: 'button' | 'submit'
    }>(),
    {
        type: 'button',
    },
)
</script>

<style lang="scss" scoped>
.button {
    @apply text-white p-2 min-w-[100px] rounded;
    @apply bg-brand-blue hover:bg-brand-blue-darker transition-colors;
}
</style>
