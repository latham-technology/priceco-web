<template>
  <label class="input-autocomplete">
    <span class="input-autocomplete__label">{{ label }}</span>

    <Combobox
      v-bind="$attrs"
      by="value"
      @update:model-value="
        (option) => $emit('update:modelValue', props.reduce(option))
      "
    >
      <div
        class="relative w-full cursor-default overflow-hidden rounded bg-gray-100"
      >
        <ComboboxInput
          class="input-autocomplete__input"
          :display-value="(option: Option) => option.label"
        />
        <ComboboxButton class="input-autocomplete__button">
          <span
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
          >
            <ChevronUpDownIcon
              aria-hidden="true"
              class="h-5 w-5 text-gray-400"
            />
          </span>
        </ComboboxButton>
        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ComboboxOptions class="input-autocomplete__options">
            <ComboboxOption
              v-for="(option, index) in props.options"
              :key="index"
              v-slot="{ active, selected }"
              as="template"
              :disabled="option.disabled"
              :value="option"
            >
              <li
                class="input-autocomplete__option"
                :class="{
                  'input-autocomplete__option': true,
                  'input-autocomplete__option--selected': active,
                }"
              >
                <span
                  :class="[
                    selected ? 'font-medium' : 'font-normal',
                    'block truncate',
                  ]"
                >
                  {{ option.label }}
                </span>

                <span
                  v-if="selected"
                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-blue"
                >
                  <CheckIcon aria-hidden="true" class="h-5 w-5" />
                </span>
              </li>
            </ComboboxOption>
          </ComboboxOptions>
        </transition>
      </div>
    </Combobox>

    <div v-if="hasExtra" class="input-autocomplete__extra">
      <slot name="extra" />
    </div>
    <div v-if="hasError" class="input-autocomplete__error">
      <slot name="error" />
    </div>
  </label>
</template>

<script setup lang="ts">
import {
  Combobox,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
import useInput from '~~/composables/useInput'

type Option = {
  label: string
  value: any
  disabled?: boolean
}

type Props = {
  label: string
  options: Option[]
  modelValue: any
  multiple?: boolean
  placeholder?: string
  reduce?: (option: Option) => any
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  multiple: false,
  reduce: (option: Option) => option.value,
  placeholder: 'Select',
})

defineEmits(['update:modelValue'])

const { hasExtra, hasError } = useInput()
</script>

<style lang="scss" scoped>
.input-autocomplete {
  &__label {
    @apply mb-1;
    @apply font-bold;
  }

  &__input {
    @apply w-full border-none py-2 pl-3 pr-10 text-l;
  }

  &__button {
    @apply absolute w-full cursor-default rounded bg-gray-100 py-2 pl-3 pr-10 text-left;
  }

  &__options {
    @apply absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-100 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm;
  }

  &__option {
    @apply relative cursor-default select-none py-2 pl-10 pr-4 text-gray-900;

    &--selected {
      @apply bg-brand-blue-lighter text-brand-blue-darker;
    }
  }
}
</style>
