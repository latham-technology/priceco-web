<template>
    <label
        class="input-text"
        :class="{
            'is-invalid': !!errorMessage,
            'is-valid': meta.valid,
        }"
    >
        <span v-if="label" class="input-text__label">{{
            label
        }}</span>
        <input
            v-maska="mask"
            v-bind="$attrs"
            class="input-text__input"
            :type="type"
            :value="value"
            @blur="onBlur"
            @input="onInput"
        />
        <div v-if="hasExtra" class="input-text__extra">
            <slot name="extra" />
        </div>

        <slot name="error" v-bind="{ errorMessage }">
            <InputError v-if="errorMessage" :message="errorMessage" />
        </slot>
    </label>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate'
import useInput from '@/composables/useInput'

type Props = {
    name: string
    modelValue: string
    label?: string
    type?: 'text' | 'password' | 'hidden' | 'email' | 'tel' | 'number'
    error?: string
    mask?: string
}

const props = withDefaults(defineProps<Props>(), {
    label: '',
    type: 'text',
    error: '',
    modelValue: '',
    mask: undefined,
})

const emit = defineEmits(['update:model-value'])

const { hasExtra } = useInput()
const name = toRef(props, 'name')
const { handleBlur, handleChange, meta, value, errorMessage } =
    useField(name, undefined, {
        initialValue: props.modelValue,
    })

function onBlur(event: Event) {
    emit('update:model-value', value.value)
    handleBlur(event)
}

function onInput(event: Event) {
    emit('update:model-value', value.value)
    handleChange(event)
}
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
}
</style>
