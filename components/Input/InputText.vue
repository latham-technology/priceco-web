<template>
  <label
    class="input-text"
    :class="{ 'is-invalid': !!error, 'is-valid': meta.valid }"
  >
    <span v-if="label" class="input-text__label">{{ label }}</span>
    <input
      v-bind="$attrs"
      :value="inputValue"
      :type="type"
      class="input-text__input"
      @input="handleChange"
      @blur="handleBlur"
    />
    <div v-if="hasExtra" class="input-text__extra">
      <slot name="extra" />
    </div>
    <div v-if="error" class="input-text__error">
      <slot name="error">
        {{ error }}
      </slot>
    </div>
  </label>
</template>

<script setup lang="ts">
import { RuleExpression, useField } from 'vee-validate'
import useInput from '~~/composables/useInput'

type Props = {
  name: string
  modelValue: string
  label?: string
  type?: 'text' | 'password' | 'hidden' | 'email' | 'tel' | 'number'
  validation?: RuleExpression<string>
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  type: 'text',
  validation: undefined,
  error: '',
})

const { hasExtra } = useInput()
const name = toRef(props, 'name')
const {
  handleBlur,
  handleChange,
  meta,
  value: inputValue,
} = useField(name, props.validation, {
  initialValue: props.modelValue,
})
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
    @apply border border-solid border-transparent;

    .is-invalid & {
      @apply border-red-100;
      @apply bg-red-100 bg-opacity-20;
    }
  }

  &__extra {
    @apply text-sm mt-1;
  }

  &__error {
    @apply mt-1 text-sm text-red-800 font-bold;
  }
}
</style>
