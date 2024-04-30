<template>
    <div></div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'admin',
})

const route = useRoute()

const { data, pending } = await useFetch(
    `/api/applications/${route.params.id}`,
)

console.log(data)
</script>

<style scoped></style>
