<template>
    <div class="flex flex-col gap-2">
        <label :for="id">{{ props.label }}</label>
        <PrimeInputText :id="id" v-model="value" :invalid="!!error" />

        <small v-if="error" class="text-red-600">{{ error }}</small>
    </div>
</template>

<script setup>
const props = defineProps({
    label: {
        type: String,
        default: undefined,
    },
    name: {
        type: String,
        default: undefined,
    },
    modelValue: {
        type: String,
        default: '',
    },
})

const emit = defineEmits([
    'update:view-model',
    'input',
    'change',
    'blur',
])

const value = ref('')

watch(
    () => value,
    (newValue) => emit('update:view-model', newValue),
)

const id = await hash(props.label)
</script>

<style lang="scss" scoped></style>
