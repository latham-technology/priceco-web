<template>
  <iframe
    allowfullscreen="true"
    height="650"
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"
    :src="blok.url"
    style="border: 0"
    width="100%"
  ></iframe>
</template>

<script setup lang="ts">
import { VirtualTourStoryblok } from '~~/types/component-types-sb'

defineProps<{ blok: VirtualTourStoryblok }>()
</script>
