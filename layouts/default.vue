<template>
    <div class="flex flex-col h-full gap-8">
        <AppHeader />
        <main class="flex-1 container">
            <Message
                v-if="messageVisiblity"
                class="w-full mb-4"
                closable
                warning
                @close="messageVisiblity = false"
            >
                <p><b>Upcoming Holiday Store Hours</b></p>
                <p>Thursday 11/28/24: 7AM - 3PM</p>
                <p>Friday 11/29/24: 8AM - 8PM</p>
            </Message>
            <slot />
        </main>
        <AppFooter />
        <MenuMobile class="visible md:hidden" />
    </div>
</template>

<script setup>
const messageVisiblity = ref(true)
</script>

<style lang="scss" scoped></style>
