<template>
    <AppTypography class="text-red-500" tag="h1">
        {{ content }}
    </AppTypography>
</template>

<script setup>
defineProps({
    content: {
        type: String,
        required: true,
    },
})
</script>

<style lang="scss" scoped></style>
