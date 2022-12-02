<template>
  <div>
    <PageTitle
      title="Email Savings Program"
      :images="[
        '/img/etc/esp/espLg01.png',
        '/img/etc/esp/espSm01.png',
        '/img/etc/esp/espSm02.png',
      ]"
    />

    <AppTypography>
      Sign up to receive exclusive savings and other offers via email. Start
      saving now!
    </AppTypography>

    <form @submit.prevent="onSubmit">
      <section>
        <h1>Contact Information</h1>

        <InputRow>
          <InputText
            v-model="formData.contact.firstName"
            label="First Name"
            required
          />
          <InputText
            v-model="formData.contact.lastName"
            label="Last Name"
            required
          />
        </InputRow>

        <InputRow>
          <InputText
            v-model="formData.contact.email"
            label="Email Address"
            type="email"
            required
          />
          <InputText
            v-model="formData.contact.phone"
            label="Phone Number"
            type="tel"
            required
          />
        </InputRow>

        <InputRow>
          <InputText
            v-model="formData.address.line1"
            label="Address"
            required
            placeholder="Street Address"
          />
        </InputRow>
        <InputRow>
          <InputText
            v-model="formData.address.line2"
            placeholder="Apartment, suite, unit, etc. (Optional)"
          />
        </InputRow>

        <InputRow>
          <InputText v-model="formData.address.city" label="City" required />
          <InputSelect
            v-model="formData.address.state"
            :reduce="(option) => option.value"
            :options="stateOptions"
            label="State"
          />
          <InputText v-model="formData.address.zip" label="Zip" required />
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
              :value="true"
            />
            <InputRadio
              v-model="formData.survey.useCoupons"
              label="No"
              :value="false"
            />
          </div>
        </InputRow>

        <h2>Were you aware of our senior discount every tuesday?</h2>
        <InputRow>
          <div class="flex gap-4">
            <InputRadio
              v-model="formData.survey.awareOfSeniorDiscount"
              label="Yes"
              :value="true"
            />
            <InputRadio
              v-model="formData.survey.awareOfSeniorDiscount"
              label="No"
              :value="false"
            />
          </div>
        </InputRow>

        <InputRow>
          <InputSelect
            v-model="formData.survey.referral"
            :reduce="(option) => option.value"
            :options="referralOptions"
            label="How did you hear about our email savings program?"
          />
        </InputRow>

        <InputRow>
          <InputTextarea
            v-model="formData.survey.comments"
            label="Comments? Suggestions?"
          />
        </InputRow>
      </section>

      <div class="flex justify-center">
        <Button type="submit"> Submit </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { UsaStates } from 'usa-states'
import { EmailSavingsFormData } from '~~/types'

const stateOptions = new UsaStates().states.map((state) => ({
  label: state.name,
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
  },
  address: {
    line1: '',
    line2: '',
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
})

const onSubmit = async () => {
  await $fetch('/api/forms/esp', {
    method: 'post',
    body: formData,
  })
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
