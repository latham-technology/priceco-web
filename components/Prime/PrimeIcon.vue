<template>
    <i :class="`pi pi-${name}`"></i>
</template>

<script setup>
defineProps({
    name: {
        type: String,
        required: true,
    },
})
</script>

<style lang="scss" scoped></style>
