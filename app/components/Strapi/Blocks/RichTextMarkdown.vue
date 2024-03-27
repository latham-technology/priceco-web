<template>
    <VueMarkdown :source="content" />
</template>

<script setup>
import VueMarkdown from 'vue-markdown-render'

defineProps({
    content: {
        type: String,
        required: true,
    },
})
</script>

<style scoped>
:deep(p + p) {
    @apply mt-4;
}
</style>
