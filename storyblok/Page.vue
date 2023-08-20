<template>
  <div v-editable="blok">
    <StoryblokComponent
      v-for="_blok in blok.body"
      :key="_blok._uid"
      :blok="_blok"
    />
  </div>
</template>

<script setup>
defineProps({ blok: Object })
</script>
