<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>

<script setup lang="ts"></script>

<style lang="scss">
html,
body,
#__nuxt {
    @apply bg-white text-gray-950;
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
