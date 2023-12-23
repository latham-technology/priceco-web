<template>
	<label
		class="input-radio"
		:class="{ 'is-valid': meta.valid, 'is-invalid': !meta.valid }"
	>
		<div class="inline-flex items-center gap-2">
			<input
				:checked="shouldBeChecked"
				class="input-radio__input"
				:name="name"
				type="radio"
				:value="value"
				@blur="handleBlur"
				@change="onChange"
			/>
			<span class="input-radio__label">{{ label }}</span>
		</div>

		<div v-if="hasExtra" class="input-radio__extra">
			<slot name="extra" />
		</div>

		<slot name="error" v-bind="{ errorMessage }">
			<InputError
				v-if="props.showError && errorMessage"
				:message="errorMessage"
			/>
		</slot>
	</label>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate'
import useInput from '@/composables/useInput'

type Props = {
	name: string
	label: string
	modelValue?: null | string | boolean | number | object
	value?: null | string | boolean | number | object
	showError?: boolean
}

const { hasExtra } = useInput()

const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	value: true,
	showError: true,
})

const emit = defineEmits(['update:model-value'])

const name = toRef(props, 'name')
const { errorMessage, meta, handleChange, handleBlur } = useField(
	name,
	undefined,
	{
		initialValue: props.modelValue,
	}
)

const shouldBeChecked = computed(() => {
	return props.modelValue === props.value
})

function onChange(event: InputEvent) {
	emit('update:model-value', props.value)
	handleChange(event)
}
</script>

<style lang="scss" scoped>
.input-radio {
	&__label {
		@apply font-bold whitespace-nowrap;
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
