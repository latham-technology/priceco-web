<template>
    <NuxtErrorBoundary @error="handleError">
        <div class="flex flex-col h-full gap-8">
            <AppHeader />
            <main class="flex-1 container">
                <NuxtPage />
            </main>
            <AppFooter />
            <MenuMobile class="visible md:hidden" />
        </div>
    </NuxtErrorBoundary>
</template>

<script setup lang="ts">
const { $sentry } = useNuxtApp()

function handleError(error) {
    if (error) {
        $sentry.captureException(error)
    }
}
</script>

<style lang="scss">
html,
body,
#__nuxt {
    height: 100%;
}

body {
    @apply font-sans;
}

a.text-link {
    @apply text-[#355974] hover:text-[#745035];
}

form {
    section {
        @apply py-8;

        h1 {
            @apply py-2 text-brand-blue;
            @apply text-2xl font-semibold;
        }

        h2 {
            @apply py-2;
            @apply text-lg font-semibold;
        }
    }
}

.tippy-box {
    &[data-theme='transparent'] {
        @apply bg-transparent;
    }
}
</style>
