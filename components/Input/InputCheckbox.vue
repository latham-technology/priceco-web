<template>
  <label class="input-checkbox">
    <span class="input-checkbox__label">{{ props.label }}</span>
    <input
      v-bind="$attrs"
      type="checkbox"
      class="input-checkbox__input"
      :checked="shouldBeChecked"
      :value="props.value"
      @input="onInput"
    >
    <div v-if="hasExtra" class="input-checkbox__extra">
      <slot name="extra" />
    </div>
    <div v-if="hasError" class="input-checkbox__error">
      <slot name="error" />
    </div>
  </label>
</template>

<script setup lang="ts">
import useInput from '~~/composables/useInput'

type Props = {
  label: string
  value: any
  modelValue: any
  trueValue: any
  falseValue: any
}

const {
  hasExtra,
  hasError
} = useInput()

const props = withDefaults(defineProps<Props>(), {
  trueValue: true,
  falseValue: false,
  modelValue: false
})
const emit = defineEmits(['update:modelValue'])

const shouldBeChecked = computed(() => {
  if (props.modelValue instanceof Array) {
    return props.modelValue.includes(props.value)
  }

  return props.modelValue === props.trueValue
})

const onInput = (event) => {
  const isChecked = event.target.checked

  if (props.modelValue instanceof Array) {
    const newValue = [...props.modelValue]

    if (isChecked) {
      newValue.push(props.value)
    } else {
      newValue.splice(newValue.indexOf(props.value), 1)
    }

    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', isChecked ? props.trueValue : props.falseValue)
  }
}
</script>

<style lang="scss" scoped>
.input-checkbox {
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
