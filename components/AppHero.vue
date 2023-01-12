<template>
  <div class="flex flex-col md:flex-row items-start gap-4">
    <div class="flex flex-col gap-2 mx-auto">
      <NuxtLink
        v-for="({ bgImage, text, ...link }, index) in links"
        :key="index"
        class="link w-full"
        v-bind="link"
        :style="`--bg-image: url(${bgImage})`"
      >
        <span class="sr-only">{{ text }}</span>
      </NuxtLink>
    </div>
    <div class="-order-1 md:order-1">
      <NuxtLink to="/savings/emailsavings">
        <span class="sr-only">Email Savings</span>
        <img src="~/assets/img/slides/slide1.jpg" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const links = [
  {
    href: '/ad',
    text: 'Weekly Ad',
    bgImage: '/img/img-option01.png',
  },
  {
    to: '/departments/bakery',
    text: 'Bakery',
    bgImage: '/img/img-option03.png',
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
  @apply h-[86px] w-[300px];
  background-image: var(--bg-image);

  &:hover {
    background-position: 0 -86px;
  }
}
</style>
