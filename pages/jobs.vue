<template>
  <div>
    <PageTitle
      title="Employment Application"
    />

    <AppTypography>
      Thanks for your interest in joining our team. It is our policy to provide staff members with employment, training, compensation and the opportunity of promotion.
    </AppTypography>
    <AppTypography>
      All PriceCo Foods employees are trained to be very helpful, professional and courteous. All of us truely enjoy providing our customers with an unexpected shopping experience, every time they come in. It should be no secret that a company earns the loyalty of the people they serve through good training as well as the inherent talents and passion of the employees selected to represent them.
    </AppTypography>
    <AppTypography>
      Employment decisions are made entirely without regard to race, color, religion, sexual orientation, gender identity, national origin, sex, age, disability, veteran status, medical condition, marital status or any other legally protected status. PriceCo Foods supports a drug-free workplace. Each applicant offered a job is required to pass a pre-employment drug screening test before they are hired.
    </AppTypography>
    <AppTypography>
      If you're looking for a flexible work schedule, an exceptional training program and advancement opportunities, then you need to be a part of our team.
    </AppTypography>

    <form @submit.prevent="onSubmit">
      <section>
        <h1>Personal Information</h1>

        <InputRow>
          <InputText v-model="formData.personal.firstName" label="First Name" />
          <InputText v-model="formData.personal.lastName" label="Last Name" />
        </InputRow>

        <InputRow>
          <InputText v-model="formData.personal.email" label="Email Address" type="email" />
          <InputText v-model="formData.personal.phone" label="Phone Number" type="tel" />
        </InputRow>

        <InputRow>
          <InputText v-model="formData.personal.address" label="Street Address" />
        </InputRow>

        <InputRow>
          <InputText v-model="formData.personal.city" label="City" />
          <InputSelect v-model="formData.personal.state" :reduce="(option) => option.value" :options="stateOptions" label="State" />
          <InputText v-model="formData.personal.zip" label="ZIP" />
        </InputRow>

        <InputRow>
          <div>
            <h2>Have you been convicted of a felony?</h2>
            <div class="flex gap-4">
              <InputRadio v-model="formData.personal.felony" label="Yes" :value="true" />
              <InputRadio v-model="formData.personal.felony" label="No" :value="false" />
            </div>
          </div>

          <div v-if="formData.personal.felony">
            <InputText v-model="formData.personal.felonyDescription" label="Felony Description" />
          </div>
        </InputRow>
      </section>

      <section>
        <h1>Position Desired</h1>

        <InputRow>
          <InputText v-model="formData.position.desired" label="Position Desired" />
          <InputText v-model="formData.position.salary" label="Salary Desired" />
        </InputRow>

        <InputRow>
          <InputSelect
            v-model="formData.position.availability"
            label="Availability"
            :options="[
              { label: 'Full-time', value: 'full' },
              { label: 'Part-time', value: 'part' }
            ]"
          />
          <InputText v-model="formData.position.dateAvailable" label="Date Available" />
        </InputRow>

        <h2>Are you currently employed?</h2>
        <InputRow>
          <div class="flex gap-4">
            <InputRadio v-model="formData.position.currentlyEmployed" label="Yes" :value="true" />
            <InputRadio v-model="formData.position.currentlyEmployed" label="No" :value="false" />
          </div>
        </InputRow>
      </section>

      <section>
        <h1>Education</h1>

        <div
          v-for="(education, index) in formData.education"
          :key="education._key"
          class="border border-brand-blue p-2 mb-2 flex flex-col items-start"
        >
          <InputRow class="-mt-2">
            <InputSelect
              v-model="education.type"
              label="Type"
              :options="[
                { label: 'High School', value: 'primary' },
                { label: 'College', value: 'secondary' }
              ]"
            />
            <InputText v-model="education.name" label="Name" />
          </InputRow>

          <InputRow>
            <InputText v-model="education.location" label="Location" />
            <InputText v-model="education.subjects" label="Subjects Studied" />
          </InputRow>

          <h2>Completed?</h2>
          <InputRow>
            <div class="flex gap-4">
              <InputRadio v-model="education.completed" label="Yes" :value="true" />
              <InputRadio v-model="education.completed" label="No" :value="false" />
            </div>
          </InputRow>

          <Button class="mt-2" @click="removeEducation(index)">
            Remove
          </Button>
        </div>

        <Button @click="addEducation">
          Add Education
        </Button>
      </section>

      <section>
        <h1>Work History</h1>

        <div
          v-for="(history, index) in formData.history"
          :key="history._key"
          class="border border-brand-blue p-2 mb-2 flex flex-col items-start"
        >
          <InputRow class="-mt-2">
            <InputText v-model="history.name" label="Name" />
            <InputText v-model="history.title" label="Title" />
          </InputRow>

          <InputRow>
            <InputText v-model="history.location" label="Location" />
            <InputText v-model="history.datesEmployed" label="Dates Employed" />
          </InputRow>

          <InputRow>
            <InputText v-model="history.leaveReason" label="Reason for leaving" />
          </InputRow>

          <Button class="mt-2" @click="removeHistory(index)">
            Remove
          </Button>
        </div>

        <Button type="button" @click="addHistory">
          Add Work History
        </Button>
      </section>

      <section>
        <h1>References</h1>

        <div
          v-for="(reference, index) in formData.references"
          :key="reference._key"
          class="border border-brand-blue p-2 mb-2 flex flex-col items-start"
        >
          <InputRow class="-mt-2">
            <InputText v-model="reference.name" label="Name" />
            <InputText v-model="reference.yearsKnown" label="Years Known" />
          </InputRow>

          <InputRow>
            <InputText v-model="reference.address" label="Address" />
            <InputText v-model="reference.phone" label="Phone" />
          </InputRow>

          <Button class="mt-2" @click="removeReference(index)">
            Remove
          </Button>
        </div>

        <Button type="button" @click="addReference">
          Add Reference
        </Button>
      </section>

      <div class="flex justify-center">
        <Button type="submit">
          Submit
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { UsaStates } from 'usa-states'
import _uniqueId from 'lodash.uniqueid'

type FormData = {
  personal: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zip: string
    felony: null | boolean
    felonyDescription?: string
  }
  position: {
    desired: string
    dateAvailable: string
    availability: null | 'full' | 'part'
    salary: string
    currentlyEmployed: null | boolean
  }
  education: {
    type: null | 'primary' | 'secondary'
    name: string
    location: string
    subjects: string
    complete: null | boolean
    _key: string
  }[]
  history: {
    name: string
    location: string
    title: string
    datesEmployed: string
    leaveReason: string
    _key: string
  }[]
  references: {
    name: string
    yearsKnown: string
    address: string
    phone: string
    _key: string
  }[]
}

const stateOptions = new UsaStates().states.map(state => ({
  label: state.name,
  value: state.abbreviation
}))

const formData = reactive<FormData>({
  personal: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    felony: null,
    felonyDescription: ''
  },
  position: {
    desired: '',
    dateAvailable: '',
    availability: null,
    salary: '',
    currentlyEmployed: null
  },
  education: [],
  history: [],
  references: []
})

const addEducation = () => {
  formData.education.push({
    type: null,
    name: '',
    location: '',
    subjects: '',
    complete: null,
    _key: _uniqueId()
  })
}

const removeEducation = (index: number): void => {
  formData.education.splice(index, 1)
}

const addHistory = () => {
  formData.history.push({
    name: '',
    location: '',
    title: '',
    datesEmployed: '',
    leaveReason: '',
    _key: _uniqueId()
  })
}

const removeHistory = (index: number): void => {
  formData.history.splice(index, 1)
}

const addReference = () => {
  formData.references.push({
    name: '',
    yearsKnown: '',
    address: '',
    phone: '',
    _key: _uniqueId()
  })
}

const removeReference = (index: number): void => {
  formData.references.splice(index, 1)
}

const onSubmit = () => {
  console.log(formData)
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
