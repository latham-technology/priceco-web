<template>
  <label
    class="input-select"
    :class="{ 'is-valid': meta.valid, 'is-invalid': meta.dirty && !meta.valid }"
  >
    <span class="input-select__label">{{ label }}</span>
    <Listbox
      :name="name"
      by="value"
      @update:modelValue="(option) => handleChange(reduce(option))"
      @blur="handleBlur"
    >
      <div class="relative mt-1">
        <ListboxButton v-slot="{ value }" class="input-select__button">
          <span class="block truncate">
            {{
              !value
                ? placeholder
                : multiple
                ? value.map((_value: Option) => _value.label).join(', ')
                : value.label
            }}
          </span>
          <span
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
          >
            <ChevronUpDownIcon
              class="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </ListboxButton>
        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions class="input-select__options">
            <ListboxOption
              v-for="(option, index) in options"
              v-slot="{ active, selected }"
              :key="index"
              as="template"
              :value="option"
              :disabled="option.disabled"
            >
              <li
                class="input-select__option"
                :class="{
                  'input-select__option': true,
                  'input-select__option--selected': active,
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
                  <CheckIcon class="h-5 w-5" aria-hidden="true" />
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>

    <div v-if="hasExtra" class="input-select__extra">
      <slot name="extra" />
    </div>

    <slot name="error" v-bind="{ errorMessage }">
      <InputError
        v-if="errorMessage"
        :message="errorMessage"
        class="input-select__error"
      />
    </slot>
  </label>
</template>

<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
import { useField } from 'vee-validate'
import useInput from '~~/composables/useInput'

type Option = {
  label: string
  value: any
  disabled?: boolean
}

type Props = {
  name: string
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

const { hasExtra } = useInput()
const name = toRef(props, 'name')
const {
  handleBlur,
  handleChange,
  errorMessage,
  meta,
  value: inputValue,
} = useField(name, undefined, {
  initialValue: props.modelValue,
})
</script>

<style lang="scss" scoped>
.input-select {
  &__label {
    @apply mb-1;
    @apply font-bold;
  }

  &__button {
    @apply relative w-full cursor-default rounded bg-gray-100 py-2 pl-3 pr-10 text-left;
    @apply border border-solid border-transparent;

    .is-invalid & {
      @apply border-red-100 bg-red-100 bg-opacity-20;
    }
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

  &__error {
    @apply mt-1;
  }
}
</style>
