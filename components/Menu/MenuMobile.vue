<template>
  <div class="fixed bottom-4 right-4 z-100">
    <Tippy
      ref="tippyRef"
      :animate-fill="false"
      animation="shift-away"
      :arrow="false"
      interactive
      placement="top-start"
      theme="transparent"
      trigger="click"
    >
      <button
        id="menu-button"
        aria-controls="menu"
        aria-haspopup="true"
        class="burger-menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <template #content>
        <div class="menu-container">
          <ul id="menu" aria-labelledby="menu-button" class="menu" role="menu">
            <li v-for="item in navigationItems" :key="item.text" role="none">
              <component
                :is="componentForItem(item)"
                class="menu-item"
                role="menuitem"
                :to="item.to"
                @click.capture="handleMenuItemClick"
              >
                {{ item.text }}

                <ChevronDownIcon
                  v-if="item.children"
                  class="menu-item-chevron"
                />
              </component>

              <ul v-if="item.children" class="menu">
                <li v-for="child in item.children" :key="child.text">
                  <NuxtLink class="menu-item" :to="child.to">
                    {{ child.text }}
                  </NuxtLink>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </template>
    </Tippy>
  </div>
</template>

<script setup lang="ts">
import type { TippyComponent } from 'vue-tippy'
import { Tippy } from 'vue-tippy'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import { MenuNavigationItem } from '~~/types'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/shift-away.css'

const navigationItems = useMenu()
const componentForItem = (item: MenuNavigationItem) => {
  if (item.to) {
    return resolveComponent('NuxtLink')
  }

  return 'button'
}

const handleMenuItemClick = (event: Event) => {
  ;(event.currentTarget as HTMLElement).classList.toggle('is-open')
}

// Close the popup with a route change
const route = useRoute()
const tippyRef = ref<TippyComponent>()

watch(
  () => route.name,
  () => tippyRef.value?.hide()
)
</script>

<style scoped lang="scss">
.burger-menu {
  @apply h-12 w-12 p-2 rounded-full;
  @apply flex flex-col gap-1 justify-center items-center;
  @apply bg-brand-blue-lighter drop-shadow;

  > span {
    @apply h-1 w-full rounded;
    @apply bg-slate-800;
  }
}

.menu-container {
  @apply bg-brand-blue drop-shadow-xl rounded;
  min-width: 200px;
}
.menu {
  @apply flex flex-col;

  .menu {
    @apply hidden ml-4;
  }

  .is-open + & {
    @apply flex;
  }
}

.menu-item {
  @apply flex items-center justify-between;
  @apply w-full px-4 py-3 whitespace-nowrap font-semibold;

  .menu-item-chevron {
    @apply h-5 w-5 transition rotate-0;
  }

  &.is-open .menu-item-chevron {
    @apply rotate-180;
  }
}

.menu-item-chevron {
  @apply transition transform rotate-90;
}
</style>
