<template>
  <label class="input-textarea">
    <span class="input-textarea__label">{{ label }}</span>
    <textarea
      v-bind="$attrs"
      :value="modelValue"
      class="input-textarea__input"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <div v-if="hasExtra" class="input-textarea__extra">
      <slot name="extra" />
    </div>
    <div v-if="hasError" class="input-textarea__error">
      <slot name="error" />
    </div>
  </label>
</template>

<script setup lang="ts">
import useInput from '~~/composables/useInput'

type Props = {
  label: string
  modelValue: string
}

const { hasExtra, hasError } = useInput()

defineProps<Props>()
</script>

<style lang="scss" scoped>
.input-textarea {
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
