<template>
  <label class="input-select">
    <span class="input-select__label">{{ label }}</span>
    <input v-bing="$attrs" :value="modelValue" :type="type" class="input-select__input" @input="$emit('update:modelValue', $event.target.value)">
    <div v-if="slots.extra" class="input-select__extra">
      <slot name="extra" />
    </div>
    <div v-if="slots.error" class="input-select__error">
      <slot name="error" />
    </div>
  </label>
</template>

<script setup lang="ts">
type Props = {
  label: string
  type?: 'text' | 'password' | 'hidden' | 'email' | 'tel' | 'number'
  modelValue: string
}

withDefaults(defineProps<Props>(), {
  type: 'text'
})

const slots = useSlots()

</script>

<style lang="scss" scoped>

</style>
