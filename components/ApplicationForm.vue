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
                            v-model="formData.personal.firstName"
                            autocomplete="given-name"
                            name="personal.firstName"
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="personal.lastName"
                            >Last Name</label
                        >
                        <PrimeInputText
                            id="personal.lastName"
                            v-model="formData.personal.lastName"
                            autocomplete="family-name"
                            name="personal.lastName"
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="personal.email"
                            >Email Address</label
                        >
                        <PrimeInputText
                            id="personal.email"
                            v-model="formData.personal.email"
                            autocomplete="email"
                            name="personal.email"
                            type="email"
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="personal.phone"
                            >Phone Number</label
                        >
                        <PrimeInputText
                            id="personal.phone"
                            v-model="formData.personal.phone"
                            v-maska
                            autocomplete="phone"
                            data-maska="(###) ###-####"
                            name="personal.phone"
                            type="tel"
                        />
                    </div>

                    <div class="flex flex-col gap-2 col-span-full">
                        <label for="personal.address1">Address</label>
                        <PrimeInputText
                            id="personal.address1"
                            v-model="formData.personal.address1"
                            aria-describedby="personal.address1-help"
                            name="personal.address1"
                        />
                        <small id="personal.address1-help"
                            >Street Address</small
                        >
                    </div>

                    <div class="flex flex-col gap-2 col-span-full">
                        <PrimeInputText
                            id="personal.address2"
                            v-model="formData.personal.address2"
                            aria-describedby="personal.address2-help"
                            name="personal.address2"
                            placeholder="Apartment, suite, unit, etc."
                        />
                        <small id="personal.address2-help"
                            >Street Address Line 2</small
                        >
                    </div>

                    <div
                        class="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <div class="flex flex-col gap-2">
                            <label for="personal.city">City</label>
                            <PrimeInputText
                                id="personal.city"
                                v-model="formData.personal.city"
                                name="personal.city"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="personal.state">State</label>
                            <PrimeSelect
                                v-model="formData.personal.state"
                                filter
                                input-id="personal.state"
                                name="personal.state"
                                option-label="label"
                                option-value="value"
                                :options="stateOptions"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="zip">Zip Code</label>
                            <PrimeInputText
                                id="zip"
                                v-model="formData.personal.zip"
                                v-maska
                                data-maska="#####-####"
                            />
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
                            v-model="formData.position.desired"
                            name="position.desired"
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="position.salary"
                            >Salary Desired</label
                        >
                        <PrimeInputText
                            id="position.salary"
                            v-model="formData.position.salary"
                            name="position.salary"
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="position.availability"
                            >Availability</label
                        >
                        <PrimeSelectButton
                            v-model="formData.position.availability"
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
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="position.dateAvailable"
                            >Date Available</label
                        >
                        <PrimeDatePicker
                            id="position.dateAvailable"
                            v-model="formData.position.dateAvailable"
                            :min-date="new Date()"
                            name="position.dateAvailable"
                            placeholder="MM/DD/YYYY"
                            show-button-bar
                            show-icon
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="position.currentlyEmployed"
                            >Are you currently employed?</label
                        >
                        <PrimeSelectButton
                            v-model="
                                formData.position.currentlyEmployed
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
                    v-for="(history, index) in formData.history"
                    :key="history._key"
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
                                v-model="history.name"
                                :name="`history[${index}].name`"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label :for="`history[${index}].title`"
                                >Job Title</label
                            >
                            <PrimeInputText
                                :id="`history[${index}].title`"
                                v-model="history.title"
                                :name="`history[${index}].title`"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label :for="`history[${index}].location`"
                                >Location</label
                            >
                            <PrimeInputText
                                :id="`history[${index}].location`"
                                v-model="history.location"
                                :name="`history[${index}].location`"
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label
                                :for="`history[${index}].datesEmployed`"
                                >Dates Employed</label
                            >
                            <PrimeDatePicker
                                :id="`history[${index}].datesEmployed`"
                                v-model="formData.datesEmployed"
                                :name="`history[${index}].datesEmployed`"
                                placeholder="MM/DD/YYYY - MM/DD/YYYY"
                                selection-mode="range"
                                show-icon
                            />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label
                                :for="`history[${index}].leaveReason`"
                                >Reason for leaving</label
                            >
                            <PrimeInputText
                                :id="`history[${index}].leaveReason`"
                                v-model="history.leaveReason"
                                :name="`history[${index}].leaveReason`"
                            />
                        </div>
                    </div>

                    <Button
                        v-if="history._removable"
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
                    v-for="(education, index) in formData.education"
                    :key="education._key"
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
                                v-model="education.type"
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
                        </div>
                    </div>
                    <InputRow class="-mt-2">
                        <InputSelect
                            v-model="education.type"
                            label="Type"
                            :name="`education[${index}].type`"
                            :options="[
                                {
                                    label: 'High School',
                                    value: 'primary',
                                },
                                {
                                    label: 'College',
                                    value: 'secondary',
                                },
                            ]"
                        />
                        <InputText
                            v-model="education.name"
                            label="Name"
                            :name="`education[${index}].name`"
                        />
                    </InputRow>

                    <InputRow>
                        <InputText
                            v-model="education.location"
                            label="Location"
                            :name="`education[${index}].location`"
                        />
                        <InputText
                            v-model="education.subjects"
                            label="Subjects Studied"
                            :name="`education[${index}].subjects`"
                        />
                    </InputRow>

                    <h2>Completed?</h2>
                    <InputError
                        v-if="errors[`education[${index}].complete`]"
                        :message="
                            errors[`education[${index}].complete`]
                        "
                    />
                    <InputRow>
                        <div class="flex gap-4">
                            <InputRadio
                                v-model="education.complete"
                                label="Yes"
                                :name="`education[${index}].complete`"
                                :show-error="false"
                                :value="true"
                            />
                            <InputRadio
                                v-model="education.complete"
                                label="No"
                                :name="`education[${index}].complete`"
                                :show-error="false"
                                :value="false"
                            />
                        </div>
                    </InputRow>

                    <Button
                        v-if="education._removable"
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
                    v-for="(reference, index) in formData.references"
                    :key="reference._key"
                    class="border border-brand-blue rounded p-3 mb-4 flex flex-col items-start"
                >
                    <InputRow class="-mt-2">
                        <InputText
                            v-model="reference.name"
                            label="Name"
                            :name="`references[${index}].name`"
                        />
                        <InputText
                            v-model="reference.yearsKnown"
                            label="Years Known"
                            :name="`references[${index}].yearsKnown`"
                        />
                    </InputRow>

                    <InputRow>
                        <InputText
                            v-model="reference.address"
                            label="Address"
                            :name="`references[${index}].address`"
                        />
                        <InputText
                            v-model="reference.phone"
                            label="Phone Number"
                            mask="(###) ###-####"
                            :name="`references[${index}].phone`"
                        />
                    </InputRow>

                    <Button
                        v-if="reference._removable"
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
import { useForm } from 'vee-validate'
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

const { errors, handleSubmit } = useForm({
    validationSchema: applicationSchema,
    initialValues: formData,
})

const [addEducation, removeEducation] = [
    (data: Partial<JobsDataEducation>) =>
        formData.education.push({
            type: null,
            name: '',
            location: '',
            subjects: '',
            complete: null,
            _key: _uniqueId(),
            _removable: true,
            ...data,
        }),
    (index: number) => formData.education.splice(index, 1),
]

const [addHistory, removeHistory] = [
    (data: Partial<JobsDataHistory>) =>
        formData.history.push({
            name: '',
            location: '',
            title: '',
            datesEmployed: '',
            leaveReason: '',
            _key: _uniqueId(),
            _removable: true,
            ...data,
        }),
    (index: number) => formData.history.splice(index, 1),
]

const [addReference, removeReference] = [
    (data: Partial<JobsDataReference>) =>
        formData.references.push({
            name: '',
            yearsKnown: '',
            address: '',
            phone: '',
            _key: _uniqueId(),
            _removable: true,
            ...data,
        }),
    (index: number) => formData.references.splice(index, 1),
]

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

addReference({ _removable: false })
addReference({ _removable: false })
addReference({ _removable: false })
addEducation({ _removable: false })
</script>

<style scoped></style>
