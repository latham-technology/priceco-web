<template>
  <div class="page-title">
    <div v-if="images" class="page-title__images">
      <template v-for="(image, index) in images">
        <img v-if="typeof image === 'string'" :key="`string-${index}`" alt="" :src="image">
        <img v-else-if="typeof image === 'object'" :key="`object-${index}`" v-bind="image">
      </template>
    </div>

    <AppTypography tag="h1" class="text-red-500">
      {{ title }}
    </AppTypography>
  </div>
</template>

<script setup lang="ts">
defineProps<{ images?: string[], title?: string }>()
</script>

<style lang="scss" scoped>
.page-title {
  &__images {
    display: grid;
    grid-template-columns: 1fr 145px 145px;
    @apply gap-2 mb-4;

    img {
      @apply w-auto h-full;
      @apply border border-solid border-brand-blue;
    }
  }

  &__title {

  }
}
</style>
