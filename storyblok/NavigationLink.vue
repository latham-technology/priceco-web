<template>
  <component
    :is="componentProps.is"
    v-bind="componentProps"
    class="p-4 border-solid transition-colors border-[#1b2d3a] text-[#355974] font-bold"
  >
    {{ blok.title }}
  </component>
</template>

<script setup lang="ts">
import { NavigationLinkStoryblok } from '~~/types/component-types-sb'

const props = defineProps<{ blok: NavigationLinkStoryblok }>()

const componentProps = computed(() => {
  switch (props.blok.link?.linktype) {
    case 'story': {
      return {
        is: resolveComponent('NuxtLink'),
        to:
          props.blok.link.cached_url === 'home'
            ? '/'
            : `/${props.blok.link.cached_url}`,
      }
    }

    case 'url':
    default: {
      return {
        is: 'a',
        href: props.blok.link?.url,
      }
    }
  }
})
</script>

<style scoped></style>
