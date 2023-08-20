<template>
  <AppTypography v-editable="blok" class="text-red-500" tag="h1">
    {{ blok.content }}
  </AppTypography>
</template>

<script setup lang="ts">
import { HeadingStoryblok } from '~~/types/component-types-sb'

defineProps<{ blok: HeadingStoryblok }>()
</script>
