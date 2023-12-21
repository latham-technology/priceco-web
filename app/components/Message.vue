<template>
  <div
    class="message"
    :class="{
      error,
      success,
    }"
  >
    <slot>
      {{ message }}
    </slot>
  </div>
</template>

<script setup lang="ts">
type Props = {
  message?: string
  error?: boolean
  success?: boolean
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.message {
  @apply p-8 border border-solid rounded;
  @apply bg-blue-200 border-blue-400;
  @apply text-center;

  &.success {
    @apply bg-green-200 border-green-400;
  }

  &.error {
    @apply bg-red-200 border-red-400;
  }
}
</style>
