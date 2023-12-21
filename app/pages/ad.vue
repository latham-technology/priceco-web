<template>
  <div class="flex flex-col gap-20">
    <div v-for="url in images" :key="url">
      <img alt="" :src="url" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { data } = await useStrapi().find('ad', { populate: 'images' })

const images = computed(() =>
  data.attributes.images.data.map((image) =>
    useStrapiMedia(image.attributes.url)
  )
)

console.log(data)

useHead({
  title: `${data.attributes.title} | PriceCo Foods`,
})
</script>

<style scoped lang="scss">
.pdf-viewer {
  @apply h-full w-full min-h-screen;
}
</style>
