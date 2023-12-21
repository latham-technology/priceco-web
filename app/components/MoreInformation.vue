<template>
  <div class="whitespace-nowrap flex flex-col gap-1">
    <h2 class="text-[#333333] border-b border-dotted border-[#355974]">
      More Information
    </h2>

    <NuxtLink
      v-for="({ text, ...link }, index) in links"
      v-bind="link"
      :key="index"
      class="text-link"
    >
      {{ text }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
type Link = {
  text: string
  to?: string
  href?: string
  target?: string
}

defineProps<{ links: Link[] }>()
</script>

<style></style>
