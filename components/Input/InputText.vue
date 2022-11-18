<template>
  <label class="field">
    <span class="field__label">{{ label }}</span>
    <input v-bing="$attrs" :value="modelValue" :type="type" class="field__input" @input="$emit('update:modelValue', $event.target.value)">
    <div class="field__extra">
      <slot name="extra" />
    </div>
    <div class="field__error">
      <slot name="error" />
    </div>
  </label>
</template>

<script setup lang="ts">
interface Props {
  label: string
  type?: 'text' | 'password' | 'hidden' | 'email' | 'tel' | 'number'
  modelValue: string
}

withDefaults(defineProps<Props>(), {
  type: 'text'
})
</script>

<style lang="scss" scoped>
.field {
  @apply flex flex-col;

  &__label {
    @apply mb-1;
    @apply font-bold;
  }

  &__input {
    @apply p-2 rounded;
    @apply bg-gray-100;
  }

  &__extra {
    @apply text-sm mt-1;
  }

  &__error {
    @apply text-sm text-red-800 font-bold;
  }
}
</style>
