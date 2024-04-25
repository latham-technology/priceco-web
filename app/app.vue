<template>
    <NuxtErrorBoundary @error="handleError">
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </NuxtErrorBoundary>
</template>

<script setup lang="ts">
const { $sentry } = useNuxtApp()

function handleError(error) {
    console.error(error)

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
