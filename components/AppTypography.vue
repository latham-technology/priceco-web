<template>
  <component :is="props.tag">
    <slot />
  </component>
</template>

<script setup lang="ts">
const props = defineProps({
  tag: {
    type: String,
    default: 'p',
  },
})
</script>

<style lang="scss" scoped>
h1 {
  @apply font-serif;
  @apply text-3xl mb-4;
}

p {
  @apply mb-4;
}
</style>
