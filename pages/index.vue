<template>
  <section class="mx-auto flex flex-col gap-8">
    <AppHero class="mx-auto" />
    <StoryblokComponent v-if="story" :blok="story.content" />
  </section>
</template>

<script setup>
const story = await useAsyncStoryblok('home', { version: 'draft' })
</script>

<style lang="scss" scoped></style>
