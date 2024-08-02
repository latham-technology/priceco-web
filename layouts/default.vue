<template>
    <div class="flex flex-col h-full gap-8">
        <AppHeader />
        <main class="flex-1 container">
            <slot />
        </main>
        <AppFooter />
        <MenuMobile class="visible md:hidden" />
    </div>
</template>

<script setup></script>

<style lang="scss" scoped></style>
