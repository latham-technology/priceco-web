<template>
    <v-app>
        <v-app-bar title="PriceCo Admin"></v-app-bar>
        <v-navigation-drawer>

        </v-navigation-drawer>
        <slot />
    </v-app>
</template>

<script setup lang="ts">
const auth = useAuth()

console.log(auth)
</script>

<style scoped></style>
