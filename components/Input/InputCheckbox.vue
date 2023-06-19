<template>
  <label
    class="input-checkbox"
    :class="{ 'is-valid': meta.valid, 'is-invalid': !meta.valid }"
  >
    <div class="inline-flex items-center gap-2">
      <input
        v-bind="$attrs"
        :checked="shouldBeChecked"
        class="input-checkbox__input"
        :false-value="falseValue"
        :true-value="trueValue"
        type="checkbox"
        :value="trueValue"
        @blur="handleBlur"
        @input="handleChange"
      />
      <span class="input-checkbox__label">{{ label }}</span>
    </div>
    <div v-if="hasExtra" class="input-checkbox__extra">
      <slot name="extra" />
    </div>

    <slot name="error" v-bind="{ errorMessage }">
      <InputError
        v-if="props.showError && errorMessage"
        :message="errorMessage"
      />
    </slot>

    <div class="input-checkbox__error">
      <slot name="error" />
    </div>
  </label>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate'
import useInput from '~~/composables/useInput'

type Props = {
  name: string
  label: string
  modelValue: null | string | boolean | number | object
  trueValue?: null | string | boolean | number | object
  falseValue?: null | string | boolean | number | object
  showError?: boolean
}

const { hasExtra } = useInput()

const props = withDefaults(defineProps<Props>(), {
  trueValue: true,
  falseValue: false,
  modelValue: false,
  showError: true,
})

const name = toRef(props, 'name')
const { errorMessage, meta, handleChange, handleBlur } = useField(
  name,
  undefined,
  {
    type: 'checkbox',
    checkedValue: props.trueValue,
    uncheckedValue: props.falseValue,
    initialValue: props.modelValue,
  }
)

const shouldBeChecked = computed(() => {
  if (props.modelValue instanceof Array) {
    return props.modelValue.includes(props.value)
  }

  return props.modelValue === props.trueValue
})
</script>

<style lang="scss" scoped>
.input-checkbox {
  @apply py-2;

  &__label {
    @apply font-bold whitespace-nowrap;
  }

  &__input {
    @apply p-2 rounded;
    @apply bg-gray-100;
  }

  &__extra {
    @apply text-sm mt-1;
  }
}
</style>
