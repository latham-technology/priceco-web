<template>
    <div class="container mx-auto flex items-center gap-2 flex-wrap">
        <MenuDropdown
            v-for="(item, index) in navigationItems"
            :key="index"
            v-bind="item"
        />
    </div>
</template>

<script setup lang="ts">
const navigationItems = useMenu()
</script>

<style scoped></style>
