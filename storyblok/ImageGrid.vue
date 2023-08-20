<template>
  <div class="image-grid">
    <img
      v-for="image in blok.images.slice(0, 3)"
      :key="image.id"
      :alt="image.alt"
      :src="image.filename"
    />
  </div>
</template>

<script setup lang="ts">
import { ImageGridStoryblok } from '~~/types/component-types-sb'

defineProps<{ blok: ImageGridStoryblok }>()
</script>

<style scoped lang="scss">
.image-grid {
  @apply grid grid-cols-6;
  @apply gap-2 mb-4;
  @apply overflow-hidden;
  @apply h-[163px];

  img {
    @apply w-full h-full object-cover;
    @apply border border-solid border-brand-blue;

    &:nth-child(1) {
      @apply col-span-6 lg:col-span-4;
    }

    &:nth-child(2),
    &:nth-child(3) {
      @apply hidden lg:block;
    }
  }
}
</style>
