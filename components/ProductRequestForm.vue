<template>
    <div>
        <div v-if="formState.submitted" class="flex flex-col">
            <Message class="w-full" success>
                Thank you for your request!
            </Message>
        </div>
        <form v-else @submit.prevent="onSubmit">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section>
                    <h1>Item Information</h1>

                    <div class="grid grid-cols-1 gap-4">
                        <InputWrapper label="Brand" name="item.brand">
                            <template #input="{ props }">
                                <PrimeInputText v-bind="props" />
                            </template>
                        </InputWrapper>

                        <InputWrapper
                            label="Description"
                            name="item.description"
                        >
                            <template #input="{ props }">
                                <PrimeInputText v-bind="props" />
                            </template>
                        </InputWrapper>

                        <InputWrapper label="Size" name="item.size">
                            <template #input="{ props }">
                                <PrimeInputText v-bind="props" />
                            </template>
                        </InputWrapper>

                        <InputWrapper
                            label="Last Purchased At"
                            name="item.lastPurchased"
                        >
                            <template #input="{ props }">
                                <PrimeInputText v-bind="props" />
                            </template>
                        </InputWrapper>

                        <InputWrapper
                            label="Additional Information"
                            name="item.additionalInformation"
                        >
                            <template #input="{ props }">
                                <PrimeInputText v-bind="props" />
                            </template>
                        </InputWrapper>
                    </div>
                </section>

                <section>
                    <h1>Contact Information</h1>

                    <div class="grid grid-cols-1 gap-4">
                        <InputWrapper
                            label="Name"
                            name="contact.name"
                        >
                            <template #input="{ props }">
                                <PrimeInputText v-bind="props" />
                            </template>
                        </InputWrapper>

                        <InputWrapper
                            label="Phone Number"
                            name="contact.phone"
                        >
                            <template #input="{ props }">
                                <PrimeInputText
                                    v-maska="'(###) ###-####'"
                                    v-bind="props"
                                    type="tel"
                                />
                            </template>
                        </InputWrapper>
                    </div>
                </section>
            </div>

            <div class="flex gap-4 flex-col items-start">
                <NuxtTurnstile
                    ref="turnstileRef"
                    v-model="formData._turnstile"
                    :options="{ theme: 'light' }"
                />
                <Button type="submit"> Submit </Button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { H3Error } from 'h3'
import { FetchError } from 'ofetch'
import { useForm } from 'vee-validate'
import { object, string } from 'yup'
import type { NewItemFormData } from '@/types'

const toast = useNotification()
const constants = useConstants()
const turnstileRef = ref()

const formState = reactive({
    submitted: false,
    success: false,
})

const formData = reactive<NewItemFormData>({
    contact: {
        name: '',
        phone: '',
    },
    item: {
        size: '',
        brand: '',
        description: '',
        lastPurchased: '',
        additionalInformation: '',
    },
    _turnstile: null,
})

const validationSchema = object().shape({
    contact: object().shape({
        name: string().required().label('Name'),
        phone: string().required().label('Phone Number'),
    }),
    item: object().shape({
        size: string().required().label('Size'),
        brand: string().required().label('Brand'),
        description: string(),
        lastPurchased: string(),
        additionalInformation: string(),
    }),
})

const { handleSubmit } = useForm({
    validationSchema,
    initialValues: formData,
})

const onSubmit = handleSubmit(
    async (values) => {
        try {
            await $fetch('/api/email', {
                method: 'post',
                body: {
                    type: 'newItem',
                    payload: values,
                    _turnstile: formData._turnstile,
                },
            })

            toast.success(constants.APP_ITEM_ORDER_SUBMIT_SUCCESS)
            turnstileRef.value.reset()
            useTrackEvent('item_form_submission')
            formState.submitted = true
        } catch (error) {
            toast.error((error as FetchError<H3Error>).message)
        }

        turnstileRef.value.reset()
    },
    () => toast.error(constants.APP_FORM_VALIDATION_ERROR),
)
</script>

<style lang="scss" scoped>
form {
    section {
        @apply py-8;

        h1 {
            @apply py-2 text-brand-blue;
            @apply text-2xl font-semibold;
        }

        h2 {
            @apply py-2;
            @apply text-lg font-semibold;
        }
    }
}
</style>
