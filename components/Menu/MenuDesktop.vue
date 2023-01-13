<template>
  <div class="container mx-auto flex items-center gap-2 flex-wrap">
    <MenuDropdown
      v-for="(item, index) in navigationItems"
      :key="index"
      v-bind="item"
    />
  </div>
</template>

<script setup lang="ts">
import { MenuNavigationItem } from '~~/types'

defineProps<{
  navigationItems: MenuNavigationItem[]
}>()
</script>

<style scoped></style>
