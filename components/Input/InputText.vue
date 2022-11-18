<template>
  <label class="input-text">
    <span class="input-text__label">{{ label }}</span>
    <input v-bing="$attrs" :value="modelValue" :type="type" class="input-text__input" @input="$emit('update:modelValue', $event.target.value)">
    <div v-if="hasExtra" class="input-text__extra">
      <slot name="extra" />
    </div>
    <div v-if="hasError" class="input-text__error">
      <slot name="error" />
    </div>
  </label>
</template>

<script setup lang="ts">
import useInput from '~~/composables/useInput'

type Props = {
  label: string
  type?: 'text' | 'password' | 'hidden' | 'email' | 'tel' | 'number'
  modelValue: string
}

withDefaults(defineProps<Props>(), {
  type: 'text'
})

const {
  hasExtra,
  hasError
} = useInput()
</script>

<style lang="scss" scoped>
.input-text {
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
