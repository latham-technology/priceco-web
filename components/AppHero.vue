<template>
  <div class="flex flex-col items-center gap-4">
    <div>
      <NuxtLink to="/savings/emailsavings">
        <span class="sr-only">Email Savings</span>
        <img
          height="340"
          width="610"
          alt="Get great coupons and weekly ad deals with PriceCo's email savings program"
          src="~/assets/img/slides/slide1.jpg"
        />
      </NuxtLink>
    </div>
    <div class="flex flex-col md:flex-row gap-2 mx-auto">
      <component
        :is="componentForItem(link)"
        v-for="{ bgImage, ...link } in links"
        :key="link.text"
        class="link w-full"
        v-bind="link"
        :style="`--bg-image: url(${bgImage})`"
      >
        <span class="sr-only">{{ link.text }}</span>
      </component>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuNavigationItem } from '~~/types'

const links = [
  {
    href: '/ad',
    text: 'Weekly Ad',
    target: '_blank',
    bgImage: '/img/img-option01.png',
  },
  {
    to: '/savings/emailsavings',
    text: 'Email Savings',
    bgImage: '/img/img-option04.png',
  },
]

const componentForItem = (item: MenuNavigationItem) => {
  if (item.href) return 'a'
  if (item.to) return resolveComponent('NuxtLink')
  return 'button'
}
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
