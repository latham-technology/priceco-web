<template>
    <form @submit.prevent="onSubmit">
        <section>
            <h1>Contact Information</h1>

            <InputRow>
                <InputText
                    v-model="formData.contact.firstName"
                    label="First Name"
                    name="contact.firstName"
                />
                <InputText
                    v-model="formData.contact.lastName"
                    label="Last Name"
                    name="contact.lastName"
                />
            </InputRow>

            <InputRow>
                <InputText
                    v-model="formData.contact.email"
                    label="Email Address"
                    name="contact.email"
                    type="email"
                />
                <InputText
                    v-model="formData.contact.phone"
                    label="Phone Number"
                    mask="(###) ###-####"
                    name="contact.phone"
                    type="tel"
                />
            </InputRow>

            <InputRow>
                <InputText
                    v-model="formData.contact.address1"
                    label="Address"
                    name="contact.address1"
                    placeholder="Street Address"
                />
            </InputRow>
            <InputRow>
                <InputText
                    v-model="formData.contact.address2"
                    name="contact.address2"
                    placeholder="Apartment, suite, unit, etc. (Optional)"
                />
            </InputRow>

            <InputRow>
                <InputText
                    v-model="formData.contact.city"
                    label="City"
                    name="contact.city"
                />
                <InputCombobox
                    v-model="formData.contact.state"
                    label="State"
                    name="contact.state"
                    :options="stateOptions"
                    :reduce="(option) => option.value"
                />
                <InputText
                    v-model="formData.contact.zip"
                    label="Zip"
                    mask="#####"
                    name="contact.zip"
                />
            </InputRow>
        </section>

        <section>
            <h1>Questionnaire</h1>

            <h2>Do you use coupons?</h2>
            <InputRow>
                <div class="flex gap-4">
                    <InputRadio
                        v-model="formData.survey.useCoupons"
                        label="Yes"
                        name="survey.useCoupons"
                        value="Yes"
                    />
                    <InputRadio
                        v-model="formData.survey.useCoupons"
                        label="No"
                        name="survey.useCoupons"
                        value="No"
                    />
                </div>
            </InputRow>

            <h2>
                Were you aware of our senior discount every Tuesday?
            </h2>
            <InputRow>
                <div class="flex gap-4">
                    <InputRadio
                        v-model="
                            formData.survey.awareOfSeniorDiscount
                        "
                        label="Yes"
                        name="survey.awareOfSeniorDiscount"
                        value="Yes"
                    />
                    <InputRadio
                        v-model="
                            formData.survey.awareOfSeniorDiscount
                        "
                        label="No"
                        name="survey.awareOfSeniorDiscount"
                        value="No"
                    />
                </div>
            </InputRow>

            <InputRow>
                <InputSelect
                    v-model="formData.survey.referral"
                    label="How did you hear about our email savings program?"
                    name="survey.referral"
                    :options="referralOptions"
                    :reduce="(option) => option.value"
                />
            </InputRow>

            <InputRow>
                <InputTextarea
                    v-model="formData.survey.comments"
                    label="Comments? Suggestions?"
                    name="survey.comments"
                />
            </InputRow>
        </section>

        <div class="flex flex-col gap-4 items-start">
            <NuxtTurnstile
                ref="turnstileRef"
                v-model="formData._turnstile"
                :options="{ theme: 'light' }"
            />
            <Button type="submit"> Submit </Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { UsaStates } from 'usa-states'
import { useForm } from 'vee-validate'
import type { EmailSavingsFormData } from '@/types'
import loyaltySchema from '~/server/schemas/loyalty'

const toast = useNotification()
const constants = useConstants()
const turnstileRef = ref()

const stateOptions = new UsaStates().states.map((state) => ({
    label: state.abbreviation,
    value: state.abbreviation,
}))

const referralOptions = [
    {
        label: 'Website',
        value: 'website',
    },
    {
        label: 'Friend',
        value: 'friend',
    },
    {
        label: 'Flyer',
        value: 'flyer',
    },
    {
        label: 'Other',
        value: 'other',
    },
]

const formData = reactive<EmailSavingsFormData>({
    contact: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
    },
    survey: {
        useCoupons: null,
        awareOfSeniorDiscount: null,
        referral: null,
        comments: '',
    },
    _turnstile: null,
})

const { handleSubmit } = useForm({
    validationSchema: loyaltySchema,
    initialValues: formData,
})

const onSubmit = handleSubmit(
    async (values) => {
        try {
            await $fetch('/api/loyalty', {
                method: 'post',
                body: {
                    _turnstile: formData._turnstile,
                    ...values,
                },
            })

            toast.success(constants.APP_ESP_SUBMIT_SUCCESS)
            useTrackEvent('esp_form_submission')
        } catch (error: FetchError<H3Error>) {
            if (error.data) {
                toast.error(error.data.message)
            } else {
                toast.error(error.message)
            }
        } finally {
            turnstileRef.value.reset()
        }
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
