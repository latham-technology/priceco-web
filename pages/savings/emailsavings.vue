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

    <AppTypography
      >Sign up to receive exclusive savings and other offers via email. Start
      saving now!</AppTypography
    >

    <form @submit.prevent="onSubmit">
      <section>
        <h1>Contact Information</h1>

        <InputRow>
          <InputText
            v-model="formData.contact.firstName"
            autocomplete="given-name"
            label="First Name"
          />
          <InputText
            v-model="formData.contact.lastName"
            autocomplete="family-name"
            label="Last Name"
          />
        </InputRow>

        <InputRow>
          <InputText
            v-model="formData.contact.email"
            autocomplete="email"
            label="Email Address"
            type="email"
          />
          <InputText
            v-model="formData.contact.phone"
            autocomplete="tel"
            label="Phone Number"
          />
        </InputRow>

        <InputRow>
          <InputText
            v-model="formData.contact.address"
            autocomplete="address-line1"
            label="Address"
          />
        </InputRow>

        <InputRow>
          <InputText
            v-model="formData.contact.city"
            autocomplete="address-level2"
            label="City"
          />
          <InputAutocomplete
            v-model="formData.contact.state"
            autocomplete="address-level1"
            label="State"
            :options="stateOptions"
            :reduce="(option) => option.value"
          />
          <InputText
            v-model="formData.contact.zip"
            autocomplete="postal-code"
            label="Zip"
          />
        </InputRow>
      </section>
    </form>
  </div>
</template>

<script setup lang="ts">
import { UsaStates } from 'usa-states'

const stateOptions = new UsaStates().states.map((state) => ({
  label: state.name,
  value: state.abbreviation,
}))

const formData = reactive({
  contact: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  },
  survey: {
    useCoupons: null,
    knownSeniorDiscount: null,
    reference: null,
    comments: '',
  },
})

const onSubmit = (event: SubmitEvent) => {
  console.log(event)
}
</script>
