<template>
  <div class="relative cursor-pointer" @mouseover="isHovering = true" @mouseout="isHovering = false">
    <NuxtLink :to="props.to" class="block p-4 text-[#355974] font-bold transition-colors" :class="isHovering && `text-[#002966]`">
      {{ props.text }}
    </NuxtLink>

    <div v-if="props.children" v-show="isHovering" class="absolute top-full left-4 flex flex-col border-solid border border-[#1b2d3a] bg-[#98bede] min-w-[182px] text-sm">
      <NuxtLink v-for="(child, index) in props.children" :key="index" class="px-4 py-2 border-solid transition-colors border-[#1b2d3a] hover:bg-[#4e80a7] hover:text-white" :class="index + 1 < props.children.length ? `border-b` : ''">
        {{ child.text }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  text: String,
  to: String,
  children: Array
})

const isHovering = ref(false)
</script>
