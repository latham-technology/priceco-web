<template>
  <div v-if="message" class="input-error">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
defineProps<{ message?: string }>()
</script>

<style scoped lang="scss">
.input-error {
  @apply py-1 text-sm text-red-800 font-bold;
}
</style>
