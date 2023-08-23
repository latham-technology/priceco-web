<template>
  <div class="container mx-auto flex items-center gap-2 flex-wrap">
    <StoryblokComponent v-for="_blok in navigationMenu" :key="_blok._uid" />
  </div>
</template>

<script setup>
const storyblokApi = useStoryblokApi()
const { data } = await storyblokApi.get('cdn/stories/config', {
  version: 'draft',
  resolve_links: 'url',
})

const navigationMenu = ref(null)
navigationMenu.value = data.story.content.navigation_menu
</script>
