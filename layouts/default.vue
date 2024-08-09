<template>
    <div class="flex flex-col h-full">
        <AppHeader />

        <main class="flex-1">
            <slot />
        </main>

        <AppFooter class="mt-20" />
        <MenuMobile class="visible md:hidden" />
    </div>
</template>

<script setup></script>

<style lang="scss" scoped></style>
