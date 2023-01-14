<template>
  <div>
    <PageTitle title="Employment Application" />

    <AppTypography>
      Thanks for your interest in joining our team. It is our policy to provide
      staff members with employment, training, compensation and the opportunity
      of promotion.
    </AppTypography>
    <AppTypography>
      All PriceCo Foods employees are trained to be very helpful, professional
      and courteous. All of us truely enjoy providing our customers with an
      unexpected shopping experience, every time they come in. It should be no
      secret that a company earns the loyalty of the people they serve through
      good training as well as the inherent talents and passion of the employees
      selected to represent them.
    </AppTypography>
    <AppTypography>
      Employment decisions are made entirely without regard to race, color,
      religion, sexual orientation, gender identity, national origin, sex, age,
      disability, veteran status, medical condition, marital status or any other
      legally protected status. PriceCo Foods supports a drug-free workplace.
      Each applicant offered a job is required to pass a pre-employment drug
      screening test before they are hired.
    </AppTypography>
    <AppTypography>
      If you're looking for a flexible work schedule, an exceptional training
      program and advancement opportunities, then you need to be a part of our
      team.
    </AppTypography>

    <form @submit.prevent="onSubmit">
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
          <InputSelect
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

        <InputRow>
          <div>
            <h2>Have you been convicted of a felony?</h2>
            <InputError
              v-if="errors['personal.felony']"
              :message="errors['personal.felony']"
            />
            <div class="flex gap-4">
              <InputRadio
                v-model="formData.personal.felony"
                label="Yes"
                name="personal.felony"
                :show-error="false"
                :value="true"
              />
              <InputRadio
                v-model="formData.personal.felony"
                label="No"
                name="personal.felony"
                :show-error="false"
                :value="false"
              />
            </div>
          </div>

          <div v-if="formData.personal.felony">
            <InputText
              v-model="formData.personal.felonyDescription"
              label="Felony Description"
              name="personal.felonyDescription"
            />
          </div>
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
              v-model="formData.position.currentlyEmployed"
              label="Yes"
              name="position.currentlyEmployed"
              :show-error="false"
              :value="true"
            />
            <InputRadio
              v-model="formData.position.currentlyEmployed"
              label="No"
              name="position.currentlyEmployed"
              :show-error="false"
              :value="false"
            />
          </div>
        </InputRow>
      </section>

      <section>
        <h1>Education</h1>

        <InputError v-if="errors['education']" :message="errors['education']" />

        <div
          v-for="(education, index) in formData.education"
          :key="education._key"
          class="border border-brand-blue p-2 mb-2 flex flex-col items-start"
        >
          <InputRow class="-mt-2">
            <InputSelect
              v-model="education.type"
              label="Type"
              :name="`education[${index}].type`"
              :options="[
                { label: 'High School', value: 'primary' },
                { label: 'College', value: 'secondary' },
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
            :message="errors[`education[${index}].complete`]"
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

          <Button class="mt-2" @click="removeEducation(index)"> Remove </Button>
        </div>

        <Button @click="addEducation"> Add Education </Button>
      </section>

      <section>
        <h1>Work History</h1>
        <InputError v-if="errors['history']" :message="errors['history']" />
        <div
          v-for="(history, index) in formData.history"
          :key="history._key"
          class="border border-brand-blue p-2 mb-2 flex flex-col items-start"
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

          <Button class="mt-2" @click="removeHistory(index)"> Remove </Button>
        </div>

        <Button type="button" @click="addHistory"> Add Work History </Button>
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
          class="border border-brand-blue p-2 mb-2 flex flex-col items-start"
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

          <Button class="mt-2" @click="removeReference(index)"> Remove </Button>
        </div>

        <Button type="button" @click="addReference"> Add Reference </Button>
      </section>

      <div class="flex flex-col items-start gap-4">
        <Message
          v-if="formState.submitted && formState.success"
          class="w-full"
          success
        >
          Thank you for your application!
        </Message>

        <template v-else>
          <Turnstile v-model="formData._turnstile" />
          <Button type="submit"> Submit </Button>
        </template>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { UsaStates } from 'usa-states'
import _uniqueId from 'lodash.uniqueid'
import { useForm } from 'vee-validate'
import { array, boolean, object, string } from 'yup'
import { useToast } from 'vue-toastification'
import { FetchError } from 'ofetch'
import type { JobsFormData } from '~~/types'

const constants = useConstants()
const toast = useToast()

const stateOptions = new UsaStates().states.map((state) => ({
  label: state.name,
  value: state.abbreviation,
}))

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
    felony: null,
    felonyDescription: '',
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
  _turnstile: null,
})

const validationSchema = object().shape({
  personal: object().shape({
    firstName: string().required().label('First Name'),
    lastName: string().required().label('Last Name'),
    email: string().email().required().label('Email Address'),
    phone: string().required().min(14).label('Phone Number'),
    address1: string().required().label('Street Address'),
    address2: string(),
    city: string().required().label('City'),
    state: string().required().label('State'),
    zip: string().required().min(5).label('Zip Code'),
    felony: boolean().nullable().required().label('This'),
    felonyDescription: string().when('felony', {
      is: true,
      then: string().required('Please provide a description'),
      otherwise: string(),
    }),
  }),
  position: object().shape({
    desired: string().required().label('Position Desired'),
    dateAvailable: string().required().label('Date Available'),
    availability: string().nullable().required().label('Availability'),
    salary: string().required().label('Salary Desired'),
    currentlyEmployed: boolean().nullable().required().label('This'),
  }),
  education: array()
    .min(1, 'Must have at least 1 entry')
    .of(
      object().shape({
        type: string().nullable().required().label('Education Type'),
        name: string().required().label('Name'),
        location: string(),
        subjects: string(),
        complete: boolean().nullable().required().label('This'),
      })
    ),
  history: array()
    .min(1, 'Must have at least 1 entry')
    .of(
      object().shape({
        name: string().required().label('Company Name'),
        title: string().required().label('Job Title'),
        location: string().required().label('Location'),
        datesEmployed: string().required().label('Dates Employed'),
        leaveReason: string().required().label('This'),
      })
    ),
  references: array()
    .min(3, 'Must have at least 3 entries')
    .of(
      object().shape({
        name: string().required().label('Name'),
        yearsKnown: string().required().label('Years Known'),
        address: string(),
        phone: string().required().label('Phone Number'),
      })
    ),
})

const { errors, handleSubmit } = useForm({
  validationSchema,
  initialValues: formData,
})

const [addEducation, removeEducation] = [
  () =>
    formData.education.push({
      type: null,
      name: '',
      location: '',
      subjects: '',
      complete: null,
      _key: _uniqueId(),
    }),
  (index: number) => formData.education.splice(index, 1),
]

const [addHistory, removeHistory] = [
  () =>
    formData.history.push({
      name: '',
      location: '',
      title: '',
      datesEmployed: '',
      leaveReason: '',
      _key: _uniqueId(),
    }),
  (index: number) => formData.history.splice(index, 1),
]

const [addReference, removeReference] = [
  () =>
    formData.references.push({
      name: '',
      yearsKnown: '',
      address: '',
      phone: '',
      _key: _uniqueId(),
    }),
  (index: number) => formData.references.splice(index, 1),
]

const onSubmit = handleSubmit(
  async (values) => {
    try {
      await $fetch('/api/forms/jobs', {
        method: 'post',
        body: {
          ...values,
          _turnstile: formData._turnstile,
        },
      })

      formState.success = true
      toast.success(constants.APP_EMPLOYMENT_SUBMIT_SUCCESS)
    } catch (error) {
      formState.success = false
      toast.error((error as FetchError).message)
    }

    formState.submitted = true
  },
  () => toast.error(constants.APP_FORM_VALIDATION_ERROR)
)
</script>
