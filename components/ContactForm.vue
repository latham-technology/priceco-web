<template>
    <form id="contact" @submit.prevent="onContactFormSubmit">
        <section>
            <h1>Contact Information</h1>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputWrapper label="Name" name="name">
                    <template #input="{ props }">
                        <PrimeInputText v-bind="props" />
                    </template>
                </InputWrapper>

                <InputWrapper label="Email Address" name="email">
                    <template #input="{ props }">
                        <PrimeInputText v-bind="props" type="email" />
                    </template>
                </InputWrapper>

                <InputWrapper label="Phone Number" name="phone">
                    <template #input="{ props }">
                        <PrimeInputText
                            v-maska="'(###) ###-####'"
                            v-bind="props"
                            type="tel"
                        />
                    </template>
                </InputWrapper>

                <InputWrapper
                    :error="errors['contactMethod']"
                    label="How may we contact you?"
                >
                    <template #input="{ props }">
                        <PrimeSelectButton
                            :id="props.id"
                            v-model="contactMethodField"
                            option-label="label"
                            option-value="value"
                            :options="[
                                {
                                    label: 'Phone',
                                    value: 'phone',
                                },
                                {
                                    label: 'Email',
                                    value: 'email',
                                },
                            ]"
                        />
                    </template>
                </InputWrapper>
            </div>
        </section>

        <AppAccordion as="section" default-open>
            <template #label>
                <h1>Questionarrie</h1>
            </template>

            <template #default>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputWrapper
                        class="col-span-full"
                        :error="errors['shoppedStores']"
                        label="At which store(s) do you normally shop?"
                    >
                        <template #input>
                            <PrimeMultiSelect
                                v-model="shoppedStoresField"
                                display="chip"
                                :options="[
                                    'PriceCo Foods',
                                    'Safeway',
                                    'Savemart',
                                    'Cost-U-Less',
                                    'Walmart',
                                ]"
                                placeholder="Select stores"
                            />
                        </template>
                    </InputWrapper>

                    <InputWrapper
                        :error="errors['onlineOrdering']"
                        label="Would you use the internet to order items to pickup?"
                    >
                        <template #input>
                            <PrimeSelectButton
                                v-model="onlineOrderingField"
                                option-label="label"
                                option-value="value"
                                :options="[
                                    {
                                        label: 'Yes',
                                        value: true,
                                    },
                                    {
                                        label: 'No',
                                        value: false,
                                    },
                                ]"
                            />
                        </template>
                    </InputWrapper>

                    <InputWrapper
                        :error="errors['usesCoupons']"
                        label="Do you use coupons?"
                    >
                        <template #input>
                            <PrimeSelectButton
                                v-model="usesCouponsField"
                                option-label="label"
                                option-value="value"
                                :options="[
                                    {
                                        label: 'Yes',
                                        value: true,
                                    },
                                    {
                                        label: 'No',
                                        value: false,
                                    },
                                ]"
                            />
                        </template>
                    </InputWrapper>

                    <InputWrapper
                        :error="errors['awareSeniorDiscount']"
                        label="Are you aware of our Tuesday senior discount?"
                    >
                        <template #input>
                            <PrimeSelectButton
                                v-model="awareSeniorDiscountField"
                                option-label="label"
                                option-value="value"
                                :options="[
                                    {
                                        label: 'Yes',
                                        value: true,
                                    },
                                    {
                                        label: 'No',
                                        value: false,
                                    },
                                ]"
                            />
                        </template>
                    </InputWrapper>

                    <InputWrapper
                        :error="errors['triedRecipes']"
                        label="Have you tried our recipe suggestions?"
                    >
                        <template #input>
                            <PrimeSelectButton
                                v-model="triedRecipesField"
                                option-label="label"
                                option-value="value"
                                :options="[
                                    {
                                        label: 'Yes',
                                        value: true,
                                    },
                                    {
                                        label: 'No',
                                        value: false,
                                    },
                                ]"
                            />
                        </template>
                    </InputWrapper>
                </div>
            </template>
        </AppAccordion>

        <AppAccordion as="section" default-open>
            <template #label>
                <h1>Survey</h1>
            </template>

            <template #default>
                <div class="mb-4">
                    <p>
                        Please rate each experience using the
                        following guide:
                    </p>

                    <div class="p-4">
                        <p class="flex items-center gap-4">
                            <PrimeRating :model-value="5" readonly />
                            <span>Very pleased</span>
                        </p>

                        <p class="flex items-center gap-4">
                            <PrimeRating :model-value="1" readonly />
                            <span>Very disappointed</span>
                        </p>

                        <p class="flex items-center gap-4">
                            <PrimeRating
                                :model-value="null"
                                readonly
                            />
                            <span>No answer</span>
                        </p>
                    </div>
                </div>

                <div
                    class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4"
                >
                    <InputWrapper
                        v-for="section in ratingSections"
                        :key="section.key"
                        :error="errors[`rating.${section.key}`]"
                        :label="section.title"
                    >
                        <template #input>
                            <PrimeRating
                                v-model="ratingFields[section.key]"
                                style="--p-rating-icon-size: 2rem"
                                @change="
                                    ensureRatingZero(
                                        section.key,
                                        $event,
                                    )
                                "
                            />
                        </template>
                    </InputWrapper>
                </div>
            </template>
        </AppAccordion>

        <section>
            <InputWrapper
                label="Any questions, comments, or suggestions?"
                name="comments"
            >
                <template #input="{ props }">
                    <PrimeTextarea v-bind="props" />
                </template>
            </InputWrapper>
        </section>

        <div class="flex items-start flex-col gap-4">
            <NuxtTurnstile
                ref="turnstileRef"
                v-model="tsToken"
                :options="{ theme: 'light' }"
            />
            <Button type="submit"> Submit </Button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import feedbackSchema from '~/server/schemas/feedback'
import type { FeedbackInput } from '~/server/schemas/feedback'

const turnstileRef = ref()
const tsToken = ref()
const constants = useConstants()
const toast = useNotification()

const ratingSections = [
    { title: 'Deli Department', key: 'deli' },
    { title: 'Meat Department', key: 'meat' },
    { title: 'Seafood Department', key: 'seafood' },
    { title: 'Bakery Department', key: 'bakery' },
    { title: 'Dairy Department', key: 'dairy' },
    { title: 'Produce Department', key: 'produce' },
    { title: 'Frozen Department', key: 'frozen' },
    { title: 'Floral Department', key: 'floral' },
    {
        title: 'Were staff members helpful and courteous?',
        key: 'staff',
    },
    { title: 'Did you get checked out quickly?', key: 'checkout' },
]

const formData = reactive<FeedbackInput>({
    name: '',
    email: '',
    phone: '',
    contactMethod: null,
    shoppedStores: [],
    onlineOrdering: null,
    usesCoupons: null,
    awareSeniorDiscount: null,
    triedRecipes: null,
    comments: '',
    rating: {
        deli: 0,
        meat: 0,
        seafood: 0,
        bakery: 0,
        dairy: 0,
        produce: 0,
        frozen: 0,
        floral: 0,
        staff: 0,
        checkout: 0,
    },
})

const { errors, handleSubmit, defineField } = useForm({
    validationSchema: feedbackSchema,
    initialValues: formData,
})

const [contactMethodField] = defineField('contactMethod')
const [shoppedStoresField] = defineField('shoppedStores')
const [onlineOrderingField] = defineField('onlineOrdering')
const [usesCouponsField] = defineField('usesCoupons')
const [awareSeniorDiscountField] = defineField('awareSeniorDiscount')
const [triedRecipesField] = defineField('triedRecipes')
const ratingFields = reactive({
    deli: defineField('rating.deli')[0],
    meat: defineField('rating.meat')[0],
    seafood: defineField('rating.seafood')[0],
    bakery: defineField('rating.bakery')[0],
    dairy: defineField('rating.dairy')[0],
    produce: defineField('rating.produce')[0],
    frozen: defineField('rating.frozen')[0],
    floral: defineField('rating.floral')[0],
    staff: defineField('rating.staff')[0],
    checkout: defineField('rating.checkout')[0],
})

const onContactFormSubmit = handleSubmit(
    async (values) => {
        try {
            await $fetch('/_turnstile/validate', {
                method: 'post',
                body: {
                    token: tsToken.value,
                },
            })

            await $fetch('/api/feedback', {
                method: 'post',
                body: values,
            })

            toast.success(constants.APP_CONTACT_SUBMIT_SUCCESS)
            useTrackEvent('contact_form_submission')
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

function ensureRatingZero(key, event) {
    if (event.value === null) {
        ratingFields[key] = 0
    }
}
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
