<template>
  <div
    class="relative cursor-pointer"
    @mouseout="isHovering = false"
    @mouseover="isHovering = true"
  >
    <button
      :aria-controls="props.blok._uid"
      :aria-expanded="isHovering"
      class="block p-4 text-[#355974] font-bold transition-colors"
      :class="isHovering && `text-[#002966]`"
      role="menuitem"
      @click="isHovering = !isHovering"
      @focus="isHovering = true"
    >
      {{ props.blok.title }}
    </button>

    <div
      v-if="props.blok.navigation_links"
      v-show="isHovering"
      :id="props.blok._uid"
      class="absolute top-full left-4 flex flex-col border-solid border border-[#1b2d3a] bg-[#98bede] min-w-[182px] text-sm"
    >
      <StoryblokComponent
        v-for="(_blok, index) in props.blok.navigation_links"
        :key="_blok._uid"
        :blok="_blok"
        :class="[
          'hover:bg-[#4e80a7] hover:text-white',
          index + 1 < props.blok.navigation_links.length ? `border-b` : '',
        ]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NavigationDropdownStoryblok } from '~~/types/component-types-sb'

const props = defineProps<{ blok: NavigationDropdownStoryblok }>()

const isHovering = ref(false)
</script>
