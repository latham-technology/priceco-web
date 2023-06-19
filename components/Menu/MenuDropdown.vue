<template>
  <div
    class="relative cursor-pointer"
    @mouseout="isHovering = false"
    @mouseover="isHovering = true"
  >
    <component
      :is="componentToRender(props)"
      :aria-controls="props.children ? `menu-${props.text}` : null"
      :aria-expanded="props.children ? isHovering : null"
      class="block p-4 text-[#355974] font-bold transition-colors"
      :class="isHovering && `text-[#002966]`"
      role="menuitem"
      v-bind="props"
      @click="isHovering = !isHovering"
      @focus="isHovering = true"
    >
      {{ props.text }}
    </component>

    <div
      v-if="props.children"
      v-show="isHovering"
      :id="`menu-${props.text}`"
      class="absolute top-full left-4 flex flex-col border-solid border border-[#1b2d3a] bg-[#98bede] min-w-[182px] text-sm"
    >
      <NuxtLink
        v-for="(child, index) in props.children"
        v-bind="child"
        :key="index"
        class="px-4 py-2 border-solid transition-colors border-[#1b2d3a] hover:bg-[#4e80a7] hover:text-white"
        :class="index + 1 < props.children.length ? `border-b` : ''"
      >
        {{ child.text }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuNavigationItem } from '~~/types'

const props = defineProps<MenuNavigationItem>()

const isHovering = ref(false)

const componentToRender = (item: MenuNavigationItem) => {
  if (item.href) return 'a'
  if (item.to) return resolveComponent('NuxtLink')
  return 'button'
}
</script>
