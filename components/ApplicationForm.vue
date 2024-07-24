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
                            :invalid="
                                !!errorBag['personal.firstName']
                                    ?.length
                            "
                            name="personal.firstName"
                        />

                        <small
                            v-for="error in errorBag[
                                `personal.firstName`
                            ]"
                            :key="error"
                            class="text-red-600"
                            >{{ error }}</small
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
                            :invalid="
                                !!errorBag['personal.lastName']
                                    ?.length
                            "
                            name="personal.lastName"
                        />

                        <small
                            v-for="error in errorBag[
                                `personal.lastName`
                            ]"
                            :key="error"
                            class="text-red-600"
                            >{{ error }}</small
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
                            :invalid="
                                !!errorBag['personal.email']?.length
                            "
                            name="personal.email"
                            type="email"
                        />

                        <small
                            v-for="error in errorBag[
                                `personal.email`
                            ]"
                            :key="error"
                            class="text-red-600"
                            >{{ error }}</small
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
                            v-maska
                            autocomplete="phone"
                            data-maska="(###) ###-####"
                            :invalid="
                                !!errorBag['personal.phone']?.length
                            "
                            name="personal.phone"
                            type="tel"
                        />

                        <small
                            v-for="error in errorBag[
                                `personal.phone`
                            ]"
                            :key="error"
                            class="text-red-600"
                            >{{ error }}</small
                        >
                    </div>

                    <div class="flex flex-col gap-2 col-span-full">
                        <label for="personal.address1">Address</label>
                        <PrimeInputText
                            id="personal.address1"
                            v-model="address1Field"
                            v-bind="address1FieldProps"
                            aria-describedby="personal.address1-help"
                            :invalid="
                                !!errorBag['personal.address1']
                                    ?.length
                            "
                            name="personal.address1"
                        />
                        <small id="personal.address1-help"
                            >Street Address</small
                        >

                        <small
                            v-for="error in errorBag[
                                `personal.address1`
                            ]"
                            :key="error"
                            class="text-red-600"
                            >{{ error }}</small
                        >
                    </div>

                    <div class="flex flex-col gap-2 col-span-full">
                        <PrimeInputText
                            id="personal.address2"
                            v-model="address2Field"
                            v-bind="address2FieldProps"
                            aria-describedby="personal.address2-help"
                            :invalid="
                                !!errorBag['personal.address2']
                                    ?.length
                            "
                            name="personal.address2"
                            placeholder="Apartment, suite, unit, etc."
                        />
                        <small id="personal.address2-help"
                            >Street Address Line 2</small
                        >
                        <small
                            v-for="error in errorBag[
                                `personal.address2`
                            ]"
                            :key="error"
                            class="text-red-600"
                            >{{ error }}</small
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
                                :invalid="
                                    !!errorBag['personal.city']
                                        ?.length
                                "
                                name="personal.city"
                            />

                            <small
                                v-for="error in errorBag[
                                    `personal.city`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
                            >
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="personal.state">State</label>
                            <PrimeSelect
                                v-model="stateField"
                                v-bind="stateFieldProps"
                                filter
                                input-id="personal.state"
                                :invalid="
                                    !!errorBag['personal.state']
                                        ?.length
                                "
                                name="personal.state"
                                option-label="label"
                                option-value="value"
                                :options="stateOptions"
                            />

                            <small
                                v-for="error in errorBag[
                                    `personal.state`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
                            >
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="zip">Zip Code</label>
                            <PrimeInputText
                                id="zip"
                                v-model="zipField"
                                v-bind="zipFieldProps"
                                v-maska
                                data-maska="#####-####"
                                :invalid="
                                    !!errorBag['personal.zip']?.length
                                "
                            />

                            <small
                                v-for="error in errorBag[
                                    `personal.zip`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
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
                            :invalid="
                                !!errorBag['position.desired']?.length
                            "
                            name="position.desired"
                        />

                        <small
                            v-for="error in errorBag[
                                `position.desired`
                            ]"
                            :key="error"
                            class="text-red-600"
                            >{{ error }}</small
                        >
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="position.salary"
                            >Salary Desired</label
                        >
                        <PrimeInputText
                            id="position.salary"
                            v-model="salaryField"
                            v-bind="salaryFieldProps"
                            :invalid="
                                !!errorBag['position.salary']?.length
                            "
                            name="position.salary"
                        />

                        <small
                            v-for="error in errorBag[
                                `position.salary`
                            ]"
                            :key="error"
                            class="text-red-600"
                            >{{ error }}</small
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
                                !!errorBag['position.availability']
                                    ?.length
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
                            v-for="error in errorBag[
                                `position.availability`
                            ]"
                            :key="error"
                            class="text-red-600"
                            >{{ error }}</small
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
                            :invalid="
                                !!errorBag['position.dateAvailable']
                                    ?.length
                            "
                            :min-date="new Date()"
                            name="position.dateAvailable"
                            placeholder="MM/DD/YYYY"
                            show-button-bar
                            show-icon
                        />

                        <small
                            v-for="error in errorBag[
                                `position.dateAvailable`
                            ]"
                            :key="error"
                            class="text-red-600"
                            >{{ error }}</small
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
                                !!errorBag[
                                    'position.currentlyEmployed'
                                ]?.length
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
                            v-for="error in errorBag[
                                `position.currentlyEmployed`
                            ]"
                            :key="error"
                            class="text-red-600"
                            >{{ error }}</small
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
                    v-for="(field, index) in historyFields"
                    :key="field.key"
                    class="border border-brand-blue rounded p-3 mb-4"
                >
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <div class="flex flex-col gap-2">
                            <label :for="`history[${index}].name`"
                                >Company Name</label
                            >
                            <PrimeInputText
                                :id="`history[${index}].name`"
                                v-model="field.value.name"
                                :invalid="
                                    !!errorBag[
                                        `history[${index}].name`
                                    ]?.length
                                "
                                :name="`history[${index}].name`"
                            />

                            <small
                                v-for="error in errorBag[
                                    `history[${index}].name`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
                            >
                        </div>

                        <div class="flex flex-col gap-2">
                            <label :for="`history[${index}].title`"
                                >Job Title</label
                            >
                            <PrimeInputText
                                :id="`history[${index}].title`"
                                v-model="field.value.title"
                                :invalid="
                                    !!errorBag[
                                        `history[${index}].title`
                                    ]?.length
                                "
                                :name="`history[${index}].title`"
                            />

                            <small
                                v-for="error in errorBag[
                                    `history[${index}].title`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
                            >
                        </div>

                        <div class="flex flex-col gap-2">
                            <label :for="`history[${index}].location`"
                                >Location</label
                            >
                            <PrimeInputText
                                :id="`history[${index}].location`"
                                v-model="field.value.location"
                                :invalid="
                                    !!errorBag[
                                        `history[${index}].location`
                                    ]?.length
                                "
                                :name="`history[${index}].location`"
                            />

                            <small
                                v-for="error in errorBag[
                                    `history[${index}].location`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
                            >
                        </div>

                        <div class="flex flex-col gap-2">
                            <label
                                :for="`history[${index}].datesEmployed`"
                                >Dates Employed</label
                            >
                            <PrimeDatePicker
                                :id="`history[${index}].datesEmployed`"
                                v-model="field.value.datesEmployed"
                                :invalid="
                                    !!errorBag[
                                        `history[${index}].datesEmployed`
                                    ]?.length
                                "
                                :name="`history[${index}].datesEmployed`"
                                placeholder="MM/DD/YYYY - MM/DD/YYYY"
                                selection-mode="range"
                                show-icon
                            />

                            <small
                                v-for="error in errorBag[
                                    `history[${index}].datesEmployed`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
                            >
                        </div>

                        <div class="flex flex-col gap-2">
                            <label
                                :for="`history[${index}].leaveReason`"
                                >Reason for leaving</label
                            >
                            <PrimeInputText
                                :id="`history[${index}].leaveReason`"
                                v-model="field.value.leaveReason"
                                :invalid="
                                    !!errorBag[
                                        `history[${index}].leaveReason`
                                    ]?.length
                                "
                                :name="`history[${index}].leaveReason`"
                            />

                            <small
                                v-for="error in errorBag[
                                    `history[${index}].leaveReason`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
                            >
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
                    v-for="(field, index) in educationFields"
                    :key="field.key"
                    class="border border-brand-blue rounded p-3 mb-4"
                >
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <div class="flex flex-col gap-2">
                            <label :for="`education[${index}].type`"
                                >Type</label
                            >
                            <PrimeSelectButton
                                v-model="field.value.type"
                                :invalid="
                                    !!errorBag[
                                        `education[${index}].type`
                                    ]?.length
                                "
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
                            />

                            <small
                                v-for="error in errorBag[
                                    `education[${index}].type`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
                            >
                        </div>

                        <div class="flex flex-col gap-2">
                            <label :for="`education[${index}].name`"
                                >Name</label
                            >
                            <PrimeInputText
                                :id="`education[${index}].name`"
                                v-model="field.value.name"
                                :invalid="
                                    !!errorBag[
                                        `education[${index}].name`
                                    ]?.length
                                "
                                :name="`education[${index}].name`"
                            />

                            <small
                                v-for="error in errorBag[
                                    `education[${index}].name`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
                            >
                        </div>

                        <div class="flex flex-col gap-2">
                            <label
                                :for="`education[${index}].location`"
                                >Location</label
                            >
                            <PrimeInputText
                                :id="`education[${index}].location`"
                                v-model="field.value.location"
                                :invalid="
                                    !!errorBag[
                                        `education[${index}].location`
                                    ]?.length
                                "
                                :name="`education[${index}].location`"
                            />

                            <small
                                v-for="error in errorBag[
                                    `education[${index}].location`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
                            >
                        </div>

                        <div class="flex flex-col gap-2">
                            <label
                                :for="`education[${index}].subjects`"
                                >Subjects Studied</label
                            >
                            <PrimeInputText
                                :id="`education[${index}].subjects`"
                                v-model="field.value.subjects"
                                :invalid="
                                    !!errorBag[
                                        `education[${index}].subjects`
                                    ]?.length
                                "
                                :name="`education[${index}].subjects`"
                            />

                            <small
                                v-for="error in errorBag[
                                    `education[${index}].subjects`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
                            >
                        </div>

                        <div class="flex flex-col gap-2">
                            <label
                                :for="`education[${index}].complete`"
                                >Completed?</label
                            >
                            <PrimeSelectButton
                                v-model="field.value.complete"
                                :invalid="
                                    !!errorBag[
                                        `education[${index}].complete`
                                    ]?.length
                                "
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
                                v-for="error in errorBag[
                                    `education[${index}].complete`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
                            >
                        </div>
                    </div>

                    <Button
                        class="mt-2"
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
                    v-for="(field, index) in referenceFields"
                    :key="field.key"
                    class="border border-brand-blue rounded p-3 mb-4"
                >
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <div class="flex flex-col gap-2">
                            <label :for="`references[${index}].name`"
                                >Name</label
                            >
                            <PrimeInputText
                                :id="`references[${index}].name`"
                                v-model="field.value.name"
                                :invalid="
                                    !!errorBag[
                                        `references[${index}].name`
                                    ]?.length
                                "
                                :name="`references[${index}].name`"
                            />

                            <small
                                v-for="error in errorBag[
                                    `references[${index}].name`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
                            >
                        </div>

                        <div class="flex flex-col gap-2">
                            <label
                                :for="`references[${index}].yearsKnown`"
                                >Years Known</label
                            >
                            <PrimeInputText
                                :id="`references[${index}].yearsKnown`"
                                v-model="field.value.yearsKnown"
                                :invalid="
                                    !!errorBag[
                                        `references[${index}].yearsKnown`
                                    ]?.length
                                "
                                :name="`references[${index}].yearsKnown`"
                            />

                            <small
                                v-for="error in errorBag[
                                    `references[${index}].yearsKnown`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
                            >
                        </div>

                        <div class="flex flex-col gap-2">
                            <label
                                :for="`references[${index}].address`"
                                >Address</label
                            >
                            <PrimeInputText
                                :id="`references[${index}].address`"
                                v-model="field.value.address"
                                :invalid="
                                    !!errorBag[
                                        `references[${index}].address`
                                    ]?.length
                                "
                                :name="`references[${index}].address`"
                            />

                            <small
                                v-for="error in errorBag[
                                    `references[${index}].address`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
                            >
                        </div>

                        <div class="flex flex-col gap-2">
                            <label :for="`references[${index}].phone`"
                                >Phone Number</label
                            >
                            <PrimeInputText
                                :id="`references[${index}].phone`"
                                v-model="field.value.phone"
                                v-maska
                                data-maska="(###) ###-####"
                                :invalid="
                                    !!errorBag[
                                        `references[${index}].phone`
                                    ]?.length
                                "
                                :name="`references[${index}].phone`"
                            />

                            <small
                                v-for="error in errorBag[
                                    `references[${index}].phone`
                                ]"
                                :key="error"
                                class="text-red-600"
                                >{{ error }}</small
                            >
                        </div>
                    </div>

                    <Button
                        class="mt-2"
                        @click="removeReference(index)"
                    >
                        Remove
                    </Button>
                </div>

                <Button type="button" @click="addReference">
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
import _uniqueId from 'lodash.uniqueid'
import { useFieldArray, useForm } from 'vee-validate'
import applicationSchema from '~/server/schemas/application'
import type {
    JobsFormData,
    JobsDataReference,
    JobsDataEducation,
    JobsDataHistory,
} from '@/types'

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
        salary: '',
        currentlyEmployed: null,
    },
    education: [],
    history: [],
    references: [],
})

const { errors, handleSubmit, defineField, errorBag } = useForm({
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

const addHistory = (data) =>
    pushHistory({
        name: '',
        location: '',
        title: '',
        datesEmployed: '',
        leaveReason: '',
        ...data,
    })

const addEducation = (data) =>
    pushEducation({
        type: null,
        name: '',
        location: '',
        subjects: '',
        complete: null,
        ...data,
    })

const addReference = (data) =>
    pushReference({
        name: '',
        yearsKnown: '',
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
    () => {
        toast.error(constants.APP_FORM_VALIDATION_ERROR)
    },
)

addReference()
addReference()
addReference()
addEducation()
</script>

<style scoped></style>
