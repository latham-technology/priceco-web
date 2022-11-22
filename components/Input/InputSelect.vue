<template>
  <label class="input-select">
    <span class="input-select__label">{{ label }}</span>

    <Listbox
      :default-value="options[0]"
      by="value"
      @update:modelValue="(option) => emit('update:modelValue', option)"
    >
      <div class="relative mt-1">
        <ListboxButton
          v-slot="{ value }"
          class="input-select__button"
        >
          <span class="block truncate">
            {{ value.label }}
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
          <ListboxOptions
            class="input-select__options"
          >
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
    <div v-if="hasError" class="input-select__error">
      <slot name="error" />
    </div>
  </label>
</template>

<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption
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
  type?: 'text' | 'password' | 'hidden' | 'email' | 'tel' | 'number'
  options: Option[]
  modelValue: any
}

withDefaults(defineProps<Props>(), {
  type: 'text'
})

const emit = defineEmits(['update:modelValue'])

const {
  hasExtra,
  hasError
} = useInput()
</script>

<style lang="scss" scoped>
.input-select {
  &__button {
    @apply relative w-full cursor-default rounded-lg bg-gray-100 py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm
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
