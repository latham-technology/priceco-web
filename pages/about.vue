<template>
  <div>
    <PageTitle
      :images="[
        '/img/etc/services/servLg01.png',
        '/img/etc/services/contactSm01.jpg',
        '/img/etc/services/contactSm02.jpg',
      ]"
      title="Contact Us"
    />

    <AppTypography>
      The PriceCo Foods management and staff strive to provide customers with a
      wonderful store in which to shop, featuring a uniqueness and competitive
      pricing not normally found in your local supermarket. Our goal is to give
      you, the customer, a wonderful shopping experience each and every time
      they shop, and to provide them with those unique and/or signature items
      found only in our store! Please contact us to let us know how we're doing.
      We exist to serve you. We want to know how we can improve your shopping
      experience.
    </AppTypography>

    <div class="flex justify-between gap-2">
      <div class="flex flex-col gap-1">
        <h2 class="font-serif font-bold border-b border-solid">Address</h2>
        <a class="text-link" :href="googleMapsUrl" target="_blank">
          <p>{{ address.street }}</p>
          <p>{{ address.city }}, {{ address.state }} {{ address.zip }}</p>
        </a>
      </div>

      <div class="flex flex-col gap-1">
        <h2 class="font-serif font-bold border-b border-solid">
          Hours of Operation
        </h2>
        <template v-for="item in hours" :key="item.key">
          <p class="font-bold">{{ item.key }}</p>
          <p>{{ item.value }}</p>
        </template>
      </div>

      <div class="flex flex-col gap-1">
        <h2 class="font-serif font-bold border-b border-solid">Phone</h2>
        <a class="text-link" :href="`tel:${phone.replace(/[^0-9]/g, '')}`">{{
          phone
        }}</a>
      </div>
    </div>

    <form id="contact" @submit.prevent="onContactFormSubmit">
      <section>
        <h1>Contact Information</h1>

        <InputRow>
          <InputText
            v-model="formData.contact.name"
            :error="errors['contact.name']"
            label="Name"
            name="contact.name"
            type="text"
          />

          <InputText
            v-model="formData.contact.email"
            label="Email"
            name="contact.email"
            type="email"
            :validation="
              string().email().when('phone', {
                is: '',
                then: string().required(),
                otherwise: string(),
              })
            "
          />

          <InputText
            v-model="formData.contact.phone"
            label="Phone"
            name="contact.phone"
            type="tel"
            :validation="
              string().when('email', {
                is: '',
                then: string().required().min(10),
                otherwise: string(),
              })
            "
          />
        </InputRow>

        <h2>How may we contact you?</h2>
        <InputError
          v-if="errors['contact.preferredContactMethod']"
          :message="errors['contact.preferredContactMethod']"
        />
        <InputRow>
          <div class="flex gap-4">
            <InputRadio
              v-model="formData.contact.preferredContactMethod"
              label="Email"
              name="contact.preferredContactMethod"
              :show-error="false"
              value="email"
            />
            <InputRadio
              v-model="formData.contact.preferredContactMethod"
              label="Phone"
              name="contact.preferredContactMethod"
              :show-error="false"
              value="phone"
            />
          </div>
        </InputRow>
      </section>

      <AppAccordion as="section" default-open>
        <template #label>
          <h1>Questionarrie</h1>
        </template>

        <template #default>
          <h2>At which store(s) do you normally shop?</h2>
          <InputError
            v-if="errors['survey.shoppedStores']"
            :message="errors['survey.shoppedStores']"
          />
          <InputRow>
            <InputCheckbox
              v-for="(store, index) in [
                'PriceCo Foods',
                'Safeway',
                'Savemart',
                'Cost-U-Less',
              ]"
              :key="index"
              v-model="formData.survey.shoppedStores"
              :label="store"
              name="survey.shoppedStores"
              :show-error="false"
              :true-value="store"
            />
          </InputRow>

          <h2>Would you use the internet to order items to pickup?</h2>
          <InputRow>
            <div class="flex gap-4">
              <InputRadio
                v-model="formData.survey.wouldOrderOnline"
                label="Yes"
                name="survey.wouldOrderOnline"
                value="Yes"
              />
              <InputRadio
                v-model="formData.survey.wouldOrderOnline"
                label="No"
                name="survey.wouldOrderOnline"
                value="No"
              />
            </div>
          </InputRow>

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

          <h2>Are you aware of our senior discounts?</h2>
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

          <h2>Have you tried our recipe suggestions?</h2>
          <InputRow>
            <div class="flex gap-4">
              <InputRadio
                v-model="formData.survey.hasTriedRecipeSuggestions"
                label="Yes"
                name="survey.hasTriedRecipeSuggestions"
                value="Yes"
              />
              <InputRadio
                v-model="formData.survey.hasTriedRecipeSuggestions"
                label="No"
                name="survey.hasTriedRecipeSuggestions"
                value="No"
              />
            </div>
          </InputRow>
        </template>
      </AppAccordion>

      <AppAccordion as="section" default-open>
        <template #label>
          <h1>Survey</h1>
        </template>

        <template #default>
          <div class="flex flex-col gap-8">
            <div v-for="section in ratingSections" :key="section.key">
              <h2>{{ section.title }}</h2>
              <InputRow>
                <InputRadio
                  v-for="scale in ratingScale"
                  :key="scale.label"
                  v-model="formData.ratings[section.key]"
                  :label="scale.label"
                  :name="`ratings.${section.key}`"
                  :value="scale.value"
                />
              </InputRow>
            </div>
          </div>
        </template>
      </AppAccordion>

      <section>
        <InputRow>
          <InputTextarea
            v-model="formData.comments"
            label="Questions? Comments? Suggestions?"
            name="comments"
          />
        </InputRow>
      </section>

      <div class="flex items-start flex-col gap-4">
        <Turnstile ref="turnstileRef" v-model="formData._turnstile" />
        <Button type="submit"> Submit </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { string, object, array, number } from 'yup'
import { useForm } from 'vee-validate'
import { useToast } from 'vue-toastification'
import { SurveyFormData } from '~~/types'

const turnstileRef = ref()
const { address, phone, hours, googleMapsUrl } = useCompanyDetails().value
const constants = useConstants()
const toast = useToast()

const ratingScale = [
  { label: 'Very Pleased', value: 5 },
  { label: 'Pleased', value: 4 },
  { label: 'Neither', value: 3 },
  { label: 'Disappointed', value: 2 },
  { label: 'Very Disappointed', value: 1 },
]

const ratingSections = [
  { title: 'Deli Department', key: 'deli' },
  { title: 'Meat Department', key: 'meat' },
  { title: 'Seafood Department', key: 'seafood' },
  { title: 'Bakery Department', key: 'bakery' },
  { title: 'Dairy Department', key: 'dairy' },
  { title: 'Produce Department', key: 'produce' },
  { title: 'Frozen Department', key: 'frozen' },
  { title: 'Floral Department', key: 'floral' },
  { title: 'Were staff members helpful and courteous?', key: 'staff' },
  { title: 'Did you get checked out quickly?', key: 'checkout' },
]

const formData = reactive<SurveyFormData>({
  contact: {
    name: '',
    email: '',
    phone: '',
    preferredContactMethod: null,
  },
  survey: {
    shoppedStores: [],
    wouldOrderOnline: null,
    useCoupons: null,
    awareOfSeniorDiscount: null,
    hasTriedRecipeSuggestions: null,
  },
  ratings: {
    deli: null,
    meat: null,
    seafood: null,
    bakery: null,
    dairy: null,
    produce: null,
    frozen: null,
    floral: null,
    staff: null,
    checkout: null,
  },
  comments: '',
  _turnstile: null,
})

const validationSchema = object().shape({
  comments: string(),
  contact: object().shape(
    {
      name: string().required().label('Name'),
      email: string()
        .email()
        .when('phone', {
          is: '',
          then: string().required('Email or Phone is required'),
          otherwise: string(),
        })
        .label('Email'),
      phone: string()
        .when('email', {
          is: '',
          then: string().required('Email or Phone is required'),
          otherwise: string(),
        })
        .label('Phone'),
      preferredContactMethod: string()
        .nullable()
        .required()
        .label('Contact method'),
    },
    ['email', 'phone']
  ),
  survey: object().shape({
    shoppedStores: array(),
    wouldOrderOnline: string().nullable(),
    useCoupons: string().nullable(),
    awareOfSeniorDiscount: string().nullable(),
    hasTriedRecipeSuggestions: string().nullable(),
  }),
  ratings: object().shape(
    Object.keys(formData.ratings).reduce(
      (schema, key) => ({
        ...schema,
        [key]: number().nullable(),
      }),
      {}
    )
  ),
})

const { errors, handleSubmit } = useForm({
  validationSchema,
  initialValues: formData,
})

const onContactFormSubmit = handleSubmit(
  async (values) => {
    try {
      await $fetch('/api/forms/about', {
        method: 'post',
        body: {
          ...values,
          _turnstile: formData._turnstile,
        },
      })

      toast.success(constants.APP_CONTACT_SUBMIT_SUCCESS)
      turnstileRef.value.reset()
    } catch (error) {
      toast.error((error as Error).message)
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
