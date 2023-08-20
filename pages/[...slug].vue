<template>
  <StoryblokComponent v-if="story" :blok="story.content" />
</template>

<script setup>
const $route = useRoute()

const story = await useAsyncStoryblok($route.path.substring(1), {
  version: 'draft',
})

if (!story.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
}
</script>

<style lang="scss" scoped></style>
