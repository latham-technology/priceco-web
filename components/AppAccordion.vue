<template>
  <Disclosure v-slot="{ open }" v-bind="$attrs">
    <DisclosureButton class="flex w-full items-center gap-2">
      <ChevronUpIcon
        class="w-5 h-5"
        :class="open ? 'rotate-180 transform' : ''"
      />
      <slot name="label" v-bind="{ open }">
        {{ label }}
      </slot>
    </DisclosureButton>
    <DisclosurePanel>
      <slot />
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { ChevronUpIcon } from '@heroicons/vue/20/solid'

type Props = {
  label?: string
}

defineProps<Props>()
</script>

<style scoped></style>
