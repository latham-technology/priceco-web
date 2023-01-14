<template>
  <iframe
    allow="accelerometer; autoplay; encrypted-media; fullscreen; gyroscope; picture-in-picture"
    allowfullscreen
    class="pdf-viewer"
    scrolling="no"
    :src="url"
  />
</template>

<script setup lang="ts">
const url = 'https://91d208c3-trial.flowpaper.com/p1011122PFFlowPaperJoined/'
</script>

<style scoped lang="scss">
.pdf-viewer {
  @apply h-full w-full min-h-[400px];
}
</style>
