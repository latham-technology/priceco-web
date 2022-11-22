<template>
  <label class="input-radio">
    <span class="input-radio__label">{{ label }}</span>
    <input
      v-bind="$attrs"
      type="radio"
      class="input-radio__input"
      :value="props.value"
      :checked="shouldBeChecked"
      @input="onInput"
    >
    <div v-if="hasExtra" class="input-radio__extra">
      <slot name="extra" />
    </div>
    <div v-if="hasError" class="input-radio__error">
      <slot name="error" />
    </div>
  </label>
</template>

<script setup lang="ts">
import useInput from '~~/composables/useInput'

type Props = {
  label: string
  modelValue: any
  value: any
}

const {
  hasExtra,
  hasError
} = useInput()

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const shouldBeChecked = computed(() => {
  return props.modelValue === props.value
})

const onInput = () => {
  emit('update:modelValue', props.value)
}
</script>

<style lang="scss" scoped>
.input-radio {
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
