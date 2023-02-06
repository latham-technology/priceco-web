<template>
  <div>
    <iframe
      allow="accelerometer; autoplay; encrypted-media; fullscreen; gyroscope; picture-in-picture"
      allowfullscreen
      class="pdf-viewer"
      scrolling="no"
      src="/flowpaper/index.html"
    />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.pdf-viewer {
  @apply h-full w-full min-h-screen;
}
</style>
