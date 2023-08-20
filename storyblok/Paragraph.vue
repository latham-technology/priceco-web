<template>
  <AppTypography v-editable="blok">
    {{ blok.content }}
  </AppTypography>
</template>

<script setup lang="ts">
import { ParagraphStoryblok } from '~~/types/component-types-sb'

defineProps<{ blok: ParagraphStoryblok }>()
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
