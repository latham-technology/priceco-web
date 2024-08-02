<template>
    <div class="flex flex-col items-center gap-4">
        <div>
            <NuxtLink to="/savings/emailsavings">
                <span class="sr-only">Email Savings</span>
                <NuxtImg
                    alt="Get great coupons and weekly ad deals with PriceCo's email savings program"
                    height="340"
                    sizes="100vw md:610px"
                    src="/img/slides/slide1.jpg"
                    width="610"
                />
            </NuxtLink>
        </div>
        <div class="flex flex-col md:flex-row gap-2 mx-auto">
            <NuxtLink
                v-for="{ bgImage, ...link } in links"
                :key="link.text"
                class="link w-full"
                v-bind="link"
                :style="`--bg-image: url(${bgImage})`"
            >
                <span class="sr-only">{{ link.text }}</span>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
const links = [
    {
        to: '/ad',
        text: 'Weekly Ad',
        bgImage: '/img/img-option01.png',
    },
    {
        to: '/savings/emailsavings',
        text: 'Email Savings',
        bgImage: '/img/img-option04.png',
    },
]
</script>

<style lang="scss" scoped>
.link {
    height: 86px;
    width: 300px;
    background-image: var(--bg-image);
    background-size: cover;
    background-repeat: no-repeat;

    &:hover {
        background-position: 0 -86px;
    }
}
</style>
