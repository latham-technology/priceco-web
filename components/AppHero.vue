<template>
  <div class="flex flex-col items-center gap-4">
    <div>
      <NuxtLink to="/savings/emailsavings">
        <span class="sr-only">Email Savings</span>
        <img
          alt="Get great coupons and weekly ad deals with PriceCo's email savings program"
          src="~/assets/img/slides/slide1.jpg"
        />
      </NuxtLink>
    </div>
    <div class="flex flex-col md:flex-row gap-2 mx-auto">
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
