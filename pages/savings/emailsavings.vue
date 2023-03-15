<template>
  <div>
    <PageTitle
      :images="[
        '/img/etc/esp/espLg01.png',
        '/img/etc/esp/espSm01.png',
        '/img/etc/esp/espSm02.png',
      ]"
      title="Email Savings Program"
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
            v-model="formData.address.line1"
            label="Address"
            name="address.line1"
            placeholder="Street Address"
          />
        </InputRow>
        <InputRow>
          <InputText
            v-model="formData.address.line2"
            name="address.line2"
            placeholder="Apartment, suite, unit, etc. (Optional)"
          />
        </InputRow>

        <InputRow>
          <InputText
            v-model="formData.address.city"
            label="City"
            name="address.city"
          />
          <InputCombobox
            v-model="formData.address.state"
            label="State"
            name="address.state"
            :options="stateOptions"
            :reduce="(option) => option.value"
          />
          <InputText
            v-model="formData.address.zip"
            label="Zip"
            mask="#####"
            name="address.zip"
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

        <h2>Were you aware of our senior discount every tuesday?</h2>
        <InputRow>
          <div class="flex gap-4">
            <InputRadio
              v-model="formData.survey.awareOfSeniorDiscount"
              label="Yes"
              name="survey.awareOfSeniorDiscount"
              value="Yes"
            />
            <InputRadio
              v-model="formData.survey.awareOfSeniorDiscount"
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
            name="suvery.comments"
          />
        </InputRow>
      </section>

      <div class="flex flex-col gap-4 items-start">
        <Turnstile
          ref="turnstileRef"
          v-model="formData._turnstile"
          :options="{ theme: 'light' }"
        />
        <Button type="submit"> Submit </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification'
import { UsaStates } from 'usa-states'
import { useForm } from 'vee-validate'
import { object, string } from 'yup'
import { FetchError } from 'ofetch'
import { H3Error } from 'h3'
import { EmailSavingsFormData } from '~~/types'

const toast = useToast()
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
  _turnstile: null,
})

const validationSchema = object().shape({
  contact: object().shape({
    firstName: string().required().label('First name'),
    lastName: string().required().label('Last name'),
    email: string().required().email().label('Email'),
    phone: string().required().label('Phone number'),
  }),
  address: object().shape({
    line1: string().required().label('Address'),
    line2: string(),
    city: string().required().label('City'),
    state: string().required().label('State'),
    zip: string().required().min(5).label('Zip Code'),
  }),
  survey: object().shape({
    useCoupons: string().nullable(),
    awareOfSeniorDiscount: string().nullable(),
    referral: string().nullable(),
    comments: string().nullable(),
  }),
})

const { handleSubmit } = useForm({
  validationSchema,
  initialValues: formData,
})

const onSubmit = handleSubmit(
  async (values) => {
    try {
      await $fetch('/api/forms/esp', {
        method: 'post',
        body: {
          ...values,
          _turnstile: formData._turnstile,
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
  () => toast.error(constants.APP_FORM_VALIDATION_ERROR)
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
