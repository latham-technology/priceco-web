<template>
    <NuxtLayout>
        <div>
            <pre>{{ error }}</pre>
        </div>
    </NuxtLayout>
</template>

<script setup>
const error = useError()

console.log(error)
</script>

<style lang="scss" scoped></style>
