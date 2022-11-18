<template>
  <div class="input-row">
    <slot />
  </div>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
.input-row {
  @apply w-full;
  @apply flex gap-2;

  & :deep() {
    > * {
      @apply flex-1;
    }
  }
}
</style>
