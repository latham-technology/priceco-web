<template>
    <div class="flex flex-col gap-2">
        <label :for="id">{{ props.label }}</label>

        <slot name="input" v-bind="{ props: inputProps, value }" />

        <small v-if="errorMessage || error" class="text-red-600">{{
            errorMessage || error
        }}</small>
    </div>
</template>

<script setup>
import { useField } from 'vee-validate'

const props = defineProps({
    label: {
        type: String,
        default: '',
    },

    name: {
        type: String,
        default: '',
    },

    error: {
        type: String,
        default: undefined,
    },

    rules: {
        type: [Function, Object],
        default: undefined,
    },
})

const id = formatID(props.label)
const {
    value,
    errorMessage,
    handleReset,
    setValue,
    handleChange,
    handleBlur,
} = useField(() => props.name, props.rules)

const inputProps = computed(() => ({
    id,
    invalid: !!errorMessage.value || !!props.error,
    onBlur: (event) =>
        event.value !== undefined
            ? setValue(event.value)
            : handleBlur(event),
    onChange: (event) =>
        event.value !== undefined
            ? setValue(event.value)
            : handleChange(event),
    onInput: (event) =>
        event.value !== undefined
            ? setValue(event.value)
            : handleChange(event),
    onReset: handleReset,
    modelValue: value.value,
}))
</script>

<style lang="scss" scoped></style>
