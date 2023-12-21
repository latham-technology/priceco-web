<template>
  <div class="page-title">
    <div v-if="images" class="page-title__images">
      <template v-for="(image, index) in images">
        <img
          v-if="typeof image === 'string'"
          :key="`string-${index}`"
          alt=""
          :src="image"
          v-bind="getImageDimensionsByIndex(index)"
        />
        <img
          v-else-if="typeof image === 'object'"
          :key="`object-${index}`"
          v-bind="image"
        />
      </template>
    </div>

    <AppTypography class="text-red-500" tag="h1">
      {{ title }}
    </AppTypography>
  </div>
</template>

<script setup lang="ts">
defineProps<{ images?: string[]; title?: string }>()

function getImageDimensionsByIndex(index: number) {
  switch (index) {
    case 0:
      return {
        height: 163,
        width: 616,
      }

    case 1:
    case 2:
      return {
        height: 163,
        width: 148,
      }
  }
}
</script>

<style lang="scss" scoped>
.page-title {
  &__images {
    @apply grid grid-cols-6;
    @apply gap-2 mb-4;
    @apply overflow-hidden;

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

  &__title {
  }
}
</style>
