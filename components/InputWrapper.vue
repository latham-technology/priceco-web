<template>
    <div class="flex flex-col gap-2">
        <label :for="id">{{ props.label }}</label>

        <slot name="input" v-bind="{ props: inputProps, value }" />

        <small v-if="errorMessage" class="text-red-600">{{
            errorMessage
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
const { value, errorMessage, handleBlur, handleChange, handleReset } =
    useField(() => props.name, props.rules)

const inputProps = {
    id,
    invalid: !!errorMessage.value,
    onBlur: handleBlur,
    onChange: handleChange,
    onReset: handleReset,
    modelValue: value.value,
}
</script>

<style lang="scss" scoped></style>
