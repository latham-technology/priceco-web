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
                    <div class="flex flex-col gap-2">
                        <label for="personal.firstName"
                            >First Name</label
                        >
                        <PrimeInputText
                            id="personal.firstName"
                            v-model="firstNameField"
                            v-bind="firstNameFieldProps"
                            autocomplete="given-name"
                            :invalid="!!errors['personal.firstName']"
                            name="personal.firstName"
                        />

                        <small
                            v-if="errors['personal.firstName']"
                            class="text-red-600"
                            >{{ errors['personal.firstName'] }}</small
                        >
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="personal.lastName"
                            >Last Name</label
                        >
                        <PrimeInputText
                            id="personal.lastName"
                            v-model="lastNameField"
                            v-bind="lastNameFieldProps"
                            autocomplete="family-name"
                            :invalid="!!errors['personal.lastName']"
                            name="personal.lastName"
                        />

                        <small
                            v-if="errors['personal.lastName']"
                            class="text-red-600"
                            >{{ errors['personal.lastName'] }}</small
                        >
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="personal.email"
                            >Email Address</label
                        >
                        <PrimeInputText
                            id="personal.email"
                            v-model="emailField"
                            v-bind="emailFieldProps"
                            autocomplete="email"
                            :invalid="!!errors['personal.email']"
                            name="personal.email"
                            type="email"
                        />

                        <small
                            v-if="errors['personal.email']"
                            class="text-red-600"
                            >{{ errors['personal.email'] }}</small
                        >
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="personal.phone"
                            >Phone Number</label
                        >
                        <PrimeInputText
                            id="personal.phone"
                            v-model="phoneField"
                            v-bind="phoneFieldProps"
                            v-maska="'(###) ###-####'"
                            autocomplete="phone"
                            :invalid="!!errors['personal.phone']"
                            name="personal.phone"
                            type="tel"
                        />

                        <small
                            v-if="errors['personal.phone']"
                            class="text-red-600"
                            >{{ errors['personal.phone'] }}</small
                        >
                    </div>

                    <div class="flex flex-col gap-2 col-span-full">
                        <label for="personal.address1">Address</label>
                        <PrimeInputText
                            id="personal.address1"
                            v-model="address1Field"
                            v-bind="address1FieldProps"
                            aria-describedby="personal.address1-help"
                            :invalid="!!errors['personal.address1']"
                            name="personal.address1"
                        />
                        <small id="personal.address1-help"
                            >Street Address</small
                        >

                        <small
                            v-if="errors['personal.address1']"
                            class="text-red-600"
                            >{{ errors['personal.address1'] }}</small
                        >
                    </div>

                    <div class="flex flex-col gap-2 col-span-full">
                        <PrimeInputText
                            id="personal.address2"
                            v-model="address2Field"
                            v-bind="address2FieldProps"
                            aria-describedby="personal.address2-help"
                            :invalid="!!errors['personal.address2']"
                            name="personal.address2"
                            placeholder="Apartment, suite, unit, etc."
                        />
                        <small id="personal.address2-help"
                            >Street Address Line 2</small
                        >
                        <small
                            v-if="errors['personal.address2']"
                            class="text-red-600"
                            >{{ errors['personal.address2'] }}</small
                        >
                    </div>

                    <div
                        class="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <div class="flex flex-col gap-2">
                            <label for="personal.city">City</label>
                            <PrimeInputText
                                id="personal.city"
                                v-model="cityField"
                                v-bind="cityFieldProps"
                                :invalid="!!errors['personal.city']"
                                name="personal.city"
                            />

                            <small
                                v-if="errors['personal.city']"
                                class="text-red-600"
                                >{{ errors['personal.city'] }}</small
                            >
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="personal.state">State</label>
                            <PrimeSelect
                                v-model="stateField"
                                v-bind="stateFieldProps"
                                autocomplete="state"
                                editable
                                input-id="personal.state"
                                :invalid="!!errors['personal.state']"
                                name="personal.state"
                                option-label="value"
                                option-value="value"
                                :options="stateOptions"
                            />

                            <small
                                v-if="errors['personal.state']"
                                class="text-red-600"
                                >{{ errors['personal.state'] }}</small
                            >
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="zip">Zip Code</label>
                            <PrimeInputText
                                id="zip"
                                v-model="zipField"
                                v-bind="zipFieldProps"
                                v-maska="'#####-####'"
                                :invalid="!!errors['personal.zip']"
                            />

                            <small
                                v-if="errors['personal.zip']"
                                class="text-red-600"
                                >{{ errors['personal.zip'] }}</small
                            >
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h1>Position Desired</h1>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label for="position.desired"
                            >Position Desired</label
                        >
                        <PrimeInputText
                            id="position.desired"
                            v-model="positionDesiredField"
                            v-bind="positionDesiredFieldProps"
                            :invalid="!!errors['position.desired']"
                            name="position.desired"
                        />

                        <small
                            v-if="errors['position.desired']"
                            class="text-red-600"
                            >{{ errors['position.desired'] }}</small
                        >
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="position.salary"
                            >Salary Desired</label
                        >

                        <PrimeInputGroup>
                            <PrimeInputNumber
                                id="position.salary"
                                v-model="salaryField"
                                v-bind="salaryFieldProps"
                                currency="USD"
                                :invalid="!!errors['position.salary']"
                                :max-fraction-digits="2"
                                mode="currency"
                                name="position.salary"
                            />

                            <PrimeInputGroupAddon
                                >per hour</PrimeInputGroupAddon
                            >
                        </PrimeInputGroup>

                        <small
                            v-if="errors['position.salary']"
                            class="text-red-600"
                            >{{ errors['position.salary'] }}</small
                        >
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="position.availability"
                            >Availability</label
                        >
                        <PrimeSelectButton
                            v-model="availabilityField"
                            v-bind="availabilityFieldProps"
                            :invalid="
                                !!errors['position.availability']
                            "
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

                        <small
                            v-if="errors['position.availability']"
                            class="text-red-600"
                            >{{
                                errors['position.availability']
                            }}</small
                        >
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="position.dateAvailable"
                            >Date Available</label
                        >
                        <PrimeDatePicker
                            id="position.dateAvailable"
                            v-model="dateAvailableField"
                            v-bind="dateAvailableFieldProps"
                            v-maska="'##/##/####'"
                            :invalid="
                                !!errors['position.dateAvailable']
                            "
                            :min-date="new Date()"
                            name="position.dateAvailable"
                            placeholder="MM/DD/YYYY"
                            show-button-bar
                            show-icon
                        />

                        <small
                            v-if="errors['position.dateAvailable']"
                            class="text-red-600"
                            >{{
                                errors['position.dateAvailable']
                            }}</small
                        >
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="position.currentlyEmployed"
                            >Are you currently employed?</label
                        >
                        <PrimeSelectButton
                            v-model="currentlyEmployedField"
                            v-bind="currentlyEmployedFieldProps"
                            :invalid="
                                !!errors['position.currentlyEmployed']
                            "
                            name="position.currentlyEmployed"
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

                        <small
                            v-if="
                                errors['position.currentlyEmployed']
                            "
                            class="text-red-600"
                            >{{
                                errors['position.currentlyEmployed']
                            }}</small
                        >
                    </div>
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
                                <label :for="`history[${index}].name`"
                                    >Company Name</label
                                >
                                <PrimeInputText
                                    :id="`history[${index}].name`"
                                    v-bind="field"
                                    :invalid="!!errorMessage"
                                    :name="`history[${index}].name`"
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
