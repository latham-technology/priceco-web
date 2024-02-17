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

                <InputRow>
                    <InputText
                        v-model="formData.personal.firstName"
                        label="First Name"
                        name="personal.firstName"
                    />
                    <InputText
                        v-model="formData.personal.lastName"
                        label="Last Name"
                        name="personal.lastName"
                    />
                </InputRow>

                <InputRow>
                    <InputText
                        v-model="formData.personal.email"
                        label="Email Address"
                        name="personal.email"
                        type="email"
                    />
                    <InputText
                        v-model="formData.personal.phone"
                        label="Phone Number"
                        mask="(###) ###-####"
                        name="personal.phone"
                        type="tel"
                    />
                </InputRow>

                <InputRow>
                    <InputText
                        v-model="formData.personal.address1"
                        label="Address"
                        name="personal.address1"
                    />
                </InputRow>

                <InputRow>
                    <InputText
                        v-model="formData.personal.address2"
                        name="personal.address2"
                        placeholder="Apartment, suite, unit, etc."
                    />
                </InputRow>

                <InputRow>
                    <InputText
                        v-model="formData.personal.city"
                        label="City"
                        name="personal.city"
                    />
                    <InputCombobox
                        v-model="formData.personal.state"
                        label="State"
                        name="personal.state"
                        :options="stateOptions"
                        :reduce="(option) => option.value"
                    />
                    <InputText
                        v-model="formData.personal.zip"
                        label="Zip Code"
                        mask="#####"
                        name="personal.zip"
                    />
                </InputRow>
            </section>

            <section>
                <h1>Position Desired</h1>

                <InputRow>
                    <InputText
                        v-model="formData.position.desired"
                        label="Position Desired"
                        name="position.desired"
                    />
                    <InputText
                        v-model="formData.position.salary"
                        label="Salary Desired"
                        name="position.salary"
                    />
                </InputRow>

                <InputRow>
                    <InputSelect
                        v-model="formData.position.availability"
                        label="Availability"
                        name="position.availability"
                        :options="[
                            { label: 'Full-time', value: 'full' },
                            { label: 'Part-time', value: 'part' },
                        ]"
                    />
                    <InputText
                        v-model="formData.position.dateAvailable"
                        label="Date Available"
                        mask="##/##/####"
                        name="position.dateAvailable"
                        placeholder="MM/DD/YYYY"
                    />
                </InputRow>

                <h2>Are you currently employed?</h2>
                <InputError
                    v-if="errors['position.currentlyEmployed']"
                    :message="errors['position.currentlyEmployed']"
                />
                <InputRow>
                    <div class="flex gap-4">
                        <InputRadio
                            v-model="
                                formData.position.currentlyEmployed
                            "
                            label="Yes"
                            name="position.currentlyEmployed"
                            :show-error="false"
                            :value="true"
                        />
                        <InputRadio
                            v-model="
                                formData.position.currentlyEmployed
                            "
                            label="No"
                            name="position.currentlyEmployed"
                            :show-error="false"
                            :value="false"
                        />
                    </div>
                </InputRow>
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
                    class="border border-brand-blue rounded p-3 mb-4 flex flex-col items-start"
                >
                    <InputRow class="-mt-2">
                        <InputText
                            v-model="history.name"
                            label="Company Name"
                            :name="`history[${index}].name`"
                        />
                        <InputText
                            v-model="history.title"
                            label="Job Title"
                            :name="`history[${index}].title`"
                        />
                    </InputRow>

                    <InputRow>
                        <InputText
                            v-model="history.location"
                            label="Location"
                            :name="`history[${index}].location`"
                        />
                        <InputText
                            v-model="history.datesEmployed"
                            label="Dates Employed"
                            mask="##/##/## - ##/##/##"
                            :name="`history[${index}].datesEmployed`"
                        />
                    </InputRow>

                    <InputRow>
                        <InputText
                            v-model="history.leaveReason"
                            label="Reason for leaving"
                            :name="`history[${index}].leaveReason`"
                        />
                    </InputRow>

                    <Button
                        v-if="history._removable"
                        class="mt-2"
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
                    class="border border-brand-blue rounded p-3 mb-4 flex flex-col items-start"
                >
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
        availability: null,
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
