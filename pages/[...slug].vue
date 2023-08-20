<template>
  <StoryblokComponent v-if="story" :blok="story.content" />
</template>

<script setup>
const { slug } = useRoute().params

const story = await useAsyncStoryblok(
  slug && slug.length > 0 ? slug.join('/') : 'home',
  {
    version: 'draft',
  }
)

if (!story.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
}
</script>

<style lang="scss" scoped></style>
