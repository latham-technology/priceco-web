<template>
  <div class="flex flex-col gap-20">
    <div v-for="url in images" :key="url">
      <img alt="" :src="url" />
    </div>
  </div>
</template>

<script setup lang="ts">
const images = Object.values(
  import.meta.glob('~/assets/img/ad/*.{png,jpg,jpeg,PNG,JPEG}', {
    eager: true,
    as: 'url',
  })
)
</script>

<style scoped lang="scss">
.pdf-viewer {
  @apply h-full w-full min-h-screen;
}
</style>
