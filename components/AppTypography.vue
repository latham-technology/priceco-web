<template>
    <component :is="props.tag">
        <slot />
    </component>
</template>

<script setup lang="ts">
const props = defineProps({
    tag: {
        type: String,
        default: 'p',
    },
})
</script>

<style lang="scss" scoped>
h1,
h2,
h3,
h4,
h5 {
    @apply font-sans font-bold;
}

h1 {
    @apply text-3xl;
}

h2 {
    @apply text-xl;
}

p {
    @apply mb-4;
}

p + h1,
p + h2,
p + h3,
p + h4,
p + h5 {
    @apply mt-8;
    @apply mb-4;
}

img + p {
    @apply mt-4;
}

:deep(a) {
    @apply underline text-brand-blue-darker;
}
</style>
