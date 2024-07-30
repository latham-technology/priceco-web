<template>
    <div>
        <div v-if="formState.submitted" class="flex flex-col">
            <Message v-if="formState.success" class="w-full" success>
                Thank you for your application!
            </Message>
        </div>

        <form v-else @submit.prevent="onSubmit">
            <section>
                <h1>Personal Information</h1>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputWrapper
                        label="First Name"
                        name="personal.firstName"
                    >
                        <template #input="{ props }">
                            <PrimeInputText
                                v-bind="props"
                                autocomplete="given-name"
                            />
                        </template>
                    </InputWrapper>

                    <InputWrapper
                        label="Last Name"
                        name="personal.lastName"
                    >
                        <template #input="{ props }">
                            <PrimeInputText
                                v-bind="props"
                                autocomplete="family-name"
                            />
                        </template>
                    </InputWrapper>

                    <InputWrapper
                        label="Email Address"
                        name="personal.email"
                    >
                        <template #input="{ props }">
                            <PrimeInputText
                                v-bind="props"
                                autocomplete="email"
                                type="email"
                            />
                        </template>
                    </InputWrapper>

                    <InputWrapper
                        label="Phone Number"
                        name="personal.phone"
                    >
                        <template #input="{ props }">
                            <PrimeInputText
                                v-maska="'(###) ###-####'"
                                v-bind="props"
                                autocomplete="phone"
                                type="tel"
                            />
                        </template>
                    </InputWrapper>

                    <InputWrapper
                        class="col-span-full"
                        label="Address"
                        name="personal.address1"
                    >
                        <template #input="{ props }">
                            <PrimeInputText
                                v-bind="props"
                                aria-describedby="personal.address1-help"
                            />

                            <small id="personal.address1-help"
                                >Street Address</small
                            >
                        </template>
                    </InputWrapper>

                    <InputWrapper
                        class="col-span-full"
                        name="personal.address2"
                    >
                        <template #input="{ props }">
                            <PrimeInputText
                                v-bind="props"
                                aria-describedby="personal.address2-help"
                                placeholder="Apartment, suite, unit, etc."
                            />

                            <small id="personal.address2-help"
                                >Street Address Line 2</small
                            >
                        </template>
                    </InputWrapper>

                    <div
                        class="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <InputWrapper
                            label="City"
                            name="personal.city"
                        >
                            <template #input="{ props }">
                                <PrimeInputText v-bind="props" />
                            </template>
                        </InputWrapper>

                        <InputWrapper
                            :error="errors['personal.state']"
                            label="State"
                        >
                            <template #input="{ props }">
                                <PrimeSelect
                                    v-model="stateField"
                                    v-bind="stateFieldProps"
                                    autocomplete="state"
                                    editable
                                    :input-id="props.id"
                                    name="personal.state"
                                    option-label="value"
                                    option-value="value"
                                    :options="stateOptions"
                                />
                            </template>
                        </InputWrapper>

                        <InputWrapper
                            label="Zip Code"
                            name="personal.zip"
                        >
                            <template #input="{ props }">
                                <PrimeInputText
                                    v-maska="'#####-####'"
                                    v-bind="props"
                                />
                            </template>
                        </InputWrapper>
                    </div>
                </div>
            </section>

            <section>
                <h1>Position Desired</h1>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputWrapper
                        label="Position Desired"
                        name="position.desired"
                    >
                        <template #input="{ props }">
                            <PrimeInputText v-bind="props" />
                        </template>
                    </InputWrapper>

                    <InputWrapper
                        label="Salary Desired"
                        name="position.desired"
                    >
                        <template #input="{ props }">
                            <PrimeInputNumber
                                v-bind="props"
                                currency="USD"
                                :max-fraction-digits="2"
                                mode="currency"
                            />
                        </template>
                    </InputWrapper>

                    <InputWrapper
                        :error="errors['position.availability']"
                        label="Availability"
                    >
                        <template #input>
                            <PrimeSelectButton
                                v-model="availabilityField"
                                v-bind="availabilityFieldProps"
                                name="position.availability"
                                option-label="label"
                                option-value="value"
                                :options="[
                                    {
                                        label: 'Full-time',
                                        value: 'full-time',
                                    },
                                    {
                                        label: 'Part-time',
                                        value: 'part-time',
                                    },
                                ]"
                            />
                        </template>
                    </InputWrapper>

                    <InputWrapper
                        :error="errors['position.dateAvailable']"
                        label="Date Available"
                    >
                        <template #input="{ props }">
                            <PrimeDatePicker
                                :id="props.id"
                                v-model="dateAvailableField"
                                v-bind="dateAvailableFieldProps"
                                v-maska="'##/##/####'"
                                :min-date="new Date()"
                                placeholder="MM/DD/YYYY"
                                show-button-bar
                                show-icon
                            />
                        </template>
                    </InputWrapper>

                    <InputWrapper
                        :error="errors['position.currentlyEmployed']"
                        label="Are you currently employed?"
                    >
                        <template #input>
                            <PrimeSelectButton
                                v-model="currentlyEmployedField"
                                v-bind="currentlyEmployedFieldProps"
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
            </section>

            <section>
                <h1>Work History</h1>

                <InputError
                    v-if="errors['history']"
                    :message="errors['history']"
                />

                <div
                    v-for="(_field, index) in historyFields"
                    :key="_field.key"
                    class="border border-brand-blue rounded p-4 mb-4"
                >
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <div class="flex flex-col gap-2">
                            <Field
                                v-slot="{ field, errorMessage }"
                                :name="`history[${index}].name`"
                            >
                                <InputWrapper
                                    :error="errorMessage"
                                    label="Company Name"
                                >
                                    <template #input="{ props }">
                                        <PrimeInputText
                                            :id="props.id"
                                            v-bind="field"
                                        />
                                    </template>
                                </InputWrapper>
                            </Field>
                        </div>

                        <div class="flex flex-col gap-2">
                            <Field
                                v-slot="{ field, errorMessage }"
                                :name="`history[${index}].title`"
                            >
                                <label
                                    :for="`history[${index}].title`"
                                    >Job Title</label
                                >
                                <PrimeInputText
                                    :id="`history[${index}].title`"
                                    v-bind="field"
                                    :invalid="!!errorMessage"
                                    :name="`history[${index}].title`"
                                />

                                <small
                                    v-if="errorMessage"
                                    class="text-red-600"
                                    >{{ errorMessage }}</small
                                >
                            </Field>
                        </div>

                        <div class="flex flex-col gap-2">
                            <Field
                                v-slot="{ field, errorMessage }"
                                :name="`history[${index}].location`"
                            >
                                <label
                                    :for="`history[${index}].location`"
                                    >Location</label
                                >
                                <PrimeInputText
                                    :id="`history[${index}].location`"
                                    v-bind="field"
                                    :invalid="!!errorMessage"
                                    :name="`history[${index}].location`"
                                />

                                <small
                                    v-if="errorMessage"
                                    class="text-red-600"
                                    >{{ errorMessage }}</small
                                >
                            </Field>
                        </div>

                        <div class="flex flex-col gap-2">
                            <Field
                                v-slot="{
                                    errorMessage,
                                    handleChange,
                                    handleBlur,
                                    value,
                                }"
                                :name="`history[${index}].datesEmployed`"
                            >
                                <label
                                    :for="`history[${index}].datesEmployed`"
                                    >Dates Employed</label
                                >
                                <PrimeDatePicker
                                    :id="`history[${index}].datesEmployed`"
                                    v-maska="
                                        '##/##/#### - ##/##/####'
                                    "
                                    :invalid="!!errorMessage"
                                    :model-value="value"
                                    :name="`history[${index}].datesEmployed`"
                                    placeholder="MM/DD/YYYY - MM/DD/YYYY"
                                    selection-mode="range"
                                    show-icon
                                    @blur="handleBlur"
                                    @update:model-value="handleChange"
                                />

                                <small
                                    v-if="errorMessage"
                                    class="text-red-600"
                                    >{{ errorMessage }}</small
                                >
                            </Field>
                        </div>

                        <div class="flex flex-col gap-2">
                            <Field
                                v-slot="{ field, errorMessage }"
                                :name="`history[${index}].leaveReason`"
                            >
                                <label
                                    :for="`history[${index}].leaveReason`"
                                    >Reason for leaving</label
                                >
                                <PrimeInputText
                                    :id="`history[${index}].leaveReason`"
                                    v-bind="field"
                                    :invalid="!!errorMessage"
                                    :name="`history[${index}].leaveReason`"
                                />

                                <small
                                    v-if="errorMessage"
                                    class="text-red-600"
                                    >{{ errorMessage }}</small
                                >
                            </Field>
                        </div>
                    </div>

                    <Button
                        class="mt-4"
                        @click="removeHistory(index)"
                    >
                        Remove
                    </Button>
                </div>

                <Button type="button" @click="addHistory">
                    Add Work History
                </Button>
            </section>

            <section>
                <h1>Education</h1>

                <InputError
                    v-if="errors['education']"
                    :message="errors['education']"
                />

                <div
                    v-for="(_field, index) in educationFields"
                    :key="_field.key"
                    class="border border-brand-blue rounded p-4 mb-4"
                >
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <div class="flex flex-col gap-2">
                            <Field
                                v-slot="{
                                    errorMessage,
                                    handleChange,
                                    handleBlur,
                                    value,
                                }"
                                :name="`education[${index}].type`"
                            >
                                <label
                                    :for="`education[${index}].type`"
                                    >Type</label
                                >
                                <PrimeSelectButton
                                    :invalid="!!errorMessage"
                                    :model-value="value"
                                    :name="`education[${index}].type`"
                                    option-label="label"
                                    option-value="value"
                                    :options="[
                                        {
                                            label: 'High school',
                                            value: 'primary',
                                        },
                                        {
                                            label: 'College',
                                            value: 'secondary',
                                        },
                                    ]"
                                    @blur="handleBlur"
                                    @change="
                                        handleChange($event.value)
                                    "
                                />

                                <small
                                    v-if="errorMessage"
                                    class="text-red-600"
                                    >{{ errorMessage }}</small
                                >
                            </Field>
                        </div>

                        <div class="flex flex-col gap-2">
                            <Field
                                v-slot="{ field, errorMessage }"
                                :name="`education[${index}].name`"
                            >
                                <label
                                    :for="`education[${index}].name`"
                                    >Name</label
                                >
                                <PrimeInputText
                                    :id="`education[${index}].name`"
                                    v-bind="field"
                                    :invalid="!!errorMessage"
                                    :name="`education[${index}].name`"
                                />

                                <small
                                    v-if="errorMessage"
                                    class="text-red-600"
                                    >{{ errorMessage }}</small
                                >
                            </Field>
                        </div>

                        <div class="flex flex-col gap-2">
                            <Field
                                v-slot="{ field, errorMessage }"
                                :name="`education[${index}].location`"
                            >
                                <label
                                    :for="`education[${index}].location`"
                                    >Location</label
                                >
                                <PrimeInputText
                                    :id="`education[${index}].location`"
                                    v-bind="field"
                                    :invalid="!!errorMessage"
                                    :name="`education[${index}].location`"
                                />

                                <small
                                    v-if="errorMessage"
                                    class="text-red-600"
                                    >{{ errorMessage }}</small
                                >
                            </Field>
                        </div>

                        <div class="flex flex-col gap-2">
                            <Field
                                v-slot="{ field, errorMessage }"
                                :name="`education[${index}].subjects`"
                            >
                                <label
                                    :for="`education[${index}].subjects`"
                                    >Subjects Studied</label
                                >
                                <PrimeInputText
                                    :id="`education[${index}].subjects`"
                                    v-bind="field"
                                    :invalid="!!errorMessage"
                                    :name="`education[${index}].subjects`"
                                />

                                <small
                                    v-if="errorMessage"
                                    class="text-red-600"
                                    >{{ errorMessage }}</small
                                >
                            </Field>
                        </div>

                        <div class="flex flex-col gap-2">
                            <Field
                                v-slot="{
                                    value,
                                    handleBlur,
                                    handleChange,
                                    errorMessage,
                                }"
                                :name="`education[${index}].complete`"
                            >
                                <label
                                    :for="`education[${index}].complete`"
                                    >Completed?</label
                                >
                                <PrimeSelectButton
                                    :invalid="!!errorMessage"
                                    :model-value="value"
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
                                    @blur="handleBlur"
                                    @change="
                                        handleChange($event.value)
                                    "
                                />

                                <small
                                    v-if="errorMessage"
                                    class="text-red-600"
                                    >{{ errorMessage }}</small
                                >
                            </Field>
                        </div>
                    </div>

                    <Button
                        v-if="index > 0"
                        class="mt-4"
                        @click="removeEducation(index)"
                    >
                        Remove
                    </Button>
                </div>

                <Button @click="addEducation"> Add Education </Button>
            </section>

            <section>
                <h1>References</h1>
                <InputError
                    v-if="errors['references']"
                    :message="errors['references']"
                />
                <div
                    v-for="(_field, index) in referenceFields"
                    :key="_field.key"
                    class="border border-brand-blue rounded p-4 mb-4"
                >
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <div class="flex flex-col gap-2">
                            <Field
                                v-slot="{ field, errorMessage }"
                                :name="`references[${index}].name`"
                            >
                                <label
                                    :for="`references[${index}].name`"
                                    >Name</label
                                >
                                <PrimeInputText
                                    :id="`references[${index}].name`"
                                    v-bind="field"
                                    :invalid="!!errorMessage"
                                    :name="`references[${index}].name`"
                                />

                                <small
                                    v-if="errorMessage"
                                    class="text-red-600"
                                    >{{ errorMessage }}</small
                                >
                            </Field>
                        </div>

                        <div class="flex flex-col gap-2">
                            <Field
                                v-slot="{
                                    errorMessage,
                                    value,
                                    handleBlur,
                                    handleChange,
                                    handleInput,
                                }"
                                :name="`references[${index}].yearsKnown`"
                            >
                                <label
                                    :for="`references[${index}].yearsKnown`"
                                    >Years Known</label
                                >
                                <PrimeInputNumber
                                    :id="`references[${index}].yearsKnown`"
                                    :invalid="!!errorMessage"
                                    :model-value="value"
                                    :name="`references[${index}].yearsKnown`"
                                    @blur="handleBlur"
                                    @change="
                                        handleChange($event.value)
                                    "
                                    @input="handleInput($event.value)"
                                />

                                <small
                                    v-if="errorMessage"
                                    class="text-red-600"
                                    >{{ errorMessage }}</small
                                >
                            </Field>
                        </div>

                        <div class="flex flex-col gap-2">
                            <Field
                                v-slot="{ field, errorMessage }"
                                :name="`references[${index}].address`"
                            >
                                <label
                                    :for="`references[${index}].address`"
                                    >Address</label
                                >
                                <PrimeInputText
                                    :id="`references[${index}].address`"
                                    v-bind="field"
                                    :invalid="!!errorMessage"
                                    :name="`references[${index}].address`"
                                />

                                <small
                                    v-if="errorMessage"
                                    class="text-red-600"
                                    >{{ errorMessage }}</small
                                >
                            </Field>
                        </div>

                        <div class="flex flex-col gap-2">
                            <Field
                                v-slot="{ field, errorMessage }"
                                :name="`references[${index}].phone`"
                            >
                                <label
                                    :for="`references[${index}].phone`"
                                    >Phone Number</label
                                >
                                <PrimeInputText
                                    :id="`references[${index}].phone`"
                                    v-bind="field"
                                    v-maska="'(###) ###-####'"
                                    :invalid="!!errorMessage"
                                    :name="`references[${index}].phone`"
                                />

                                <small
                                    v-if="errorMessage"
                                    class="text-red-600"
                                    >{{ errorMessage }}</small
                                >
                            </Field>
                        </div>
                    </div>

                    <Button
                        v-if="index > 2"
                        class="mt-4"
                        @click="removeReference(index)"
                    >
                        Remove
                    </Button>
                </div>

                <Button type="button" @click="addReference()">
                    Add Reference
                </Button>
            </section>

            <div class="flex flex-col items-start gap-4">
                <NuxtTurnstile
                    ref="turnstileRef"
                    v-model="turnstile"
                    :options="{ theme: 'light' }"
                />
                <Button type="submit"> Submit </Button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { UsaStates } from 'usa-states'
import { useFieldArray, useForm, Field } from 'vee-validate'
import applicationSchema from '~/server/schemas/application'
import type { JobsFormData } from '@/types'

const stateOptions = new UsaStates().states.map((state) => ({
    label: state.name,
    value: state.abbreviation,
}))

const constants = useConstants()
const toast = useNotification()
const turnstileRef = ref()
const turnstile = ref()

const formState = reactive({
    submitted: false,
    success: false,
})

const formData = reactive<JobsFormData>({
    personal: {
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
    position: {
        desired: '',
        dateAvailable: '',
        availability: 'full-time',
        salary: null,
        currentlyEmployed: null,
    },
    education: [],
    history: [],
    references: [],
})

const { errors, handleSubmit, defineField } = useForm({
    validationSchema: applicationSchema,
    initialValues: formData,
})

const [firstNameField, firstNameFieldProps] = defineField(
    'personal.firstName',
)
const [lastNameField, lastNameFieldProps] = defineField(
    'personal.lastName',
)
const [emailField, emailFieldProps] = defineField('personal.email')
const [phoneField, phoneFieldProps] = defineField('personal.phone')
const [address1Field, address1FieldProps] = defineField(
    'personal.address1',
)
const [address2Field, address2FieldProps] = defineField(
    'personal.address2',
)
const [cityField, cityFieldProps] = defineField('personal.city')
const [stateField, stateFieldProps] = defineField('personal.state')
const [zipField, zipFieldProps] = defineField('personal.zip')
const [positionDesiredField, positionDesiredFieldProps] = defineField(
    'position.desired',
)
const [dateAvailableField, dateAvailableFieldProps] = defineField(
    'position.dateAvailable',
)
const [availabilityField, availabilityFieldProps] = defineField(
    'position.availability',
)
const [salaryField, salaryFieldProps] = defineField('position.salary')
const [currentlyEmployedField, currentlyEmployedFieldProps] =
    defineField('position.currentlyEmployed')

const {
    remove: removeEducation,
    push: pushEducation,
    fields: educationFields,
} = useFieldArray('education')
const {
    remove: removeHistory,
    push: pushHistory,
    fields: historyFields,
} = useFieldArray('history')
const {
    remove: removeReference,
    push: pushReference,
    fields: referenceFields,
} = useFieldArray('references')

const addHistory = (data = {}) =>
    pushHistory({
        name: '',
        location: '',
        title: '',
        datesEmployed: '',
        leaveReason: '',
        ...data,
    })

const addEducation = (data = {}) =>
    pushEducation({
        type: null,
        name: '',
        location: '',
        subjects: '',
        complete: null,
        ...data,
    })

const addReference = (data = {}) =>
    pushReference({
        name: '',
        yearsKnown: null,
        address: '',
        phone: '',
        ...data,
    })

const onSubmit = handleSubmit(
    async (values) => {
        try {
            await $fetch('/api/applications', {
                method: 'post',
                body: {
                    _turnstile: turnstile.value,
                    ...values,
                },
            })

            formState.success = true
            formState.submitted = true

            toast.success(constants.APP_EMPLOYMENT_SUBMIT_SUCCESS)

            useTrackEvent('employment_form_submission')
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
    (error) => {
        toast.error(constants.APP_FORM_VALIDATION_ERROR)
    },
)

addReference()
addReference()
addReference()
addEducation()
</script>

<style scoped></style>
