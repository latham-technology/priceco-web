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
        <a class="text-link" href="https://goo.gl/maps/yznsfXefHP6ayLDX9">
          <p>13765 Mono Way</p>
          <p>Sonora, CA 95370</p>
        </a>
      </div>

      <div class="flex flex-col gap-1">
        <h2 class="font-serif font-bold border-b border-solid">
          Hours of Operation
        </h2>
        <p class="font-bold">Monday - Saturday</p>
        <p>7:00 am - 9:00 pm</p>
        <p class="font-bold">Sunday</p>
        <p>8:00 am - 9:00 pm</p>
      </div>

      <div class="flex flex-col gap-1">
        <h2 class="font-serif font-bold border-b border-solid">Phone</h2>
        <a class="text-link" href="tel:2095324343">(209) 532-4343</a>
      </div>
    </div>

    <form @submit.prevent="onContactFormSubmit">
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
                :value="true"
              />
              <InputRadio
                v-model="formData.survey.wouldOrderOnline"
                label="No"
                name="survey.wouldOrderOnline"
                :value="false"
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
                :value="true"
              />
              <InputRadio
                v-model="formData.survey.useCoupons"
                label="No"
                name="survey.useCoupons"
                :value="false"
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
                :value="true"
              />
              <InputRadio
                v-model="formData.survey.awareOfSeniorDiscount"
                label="No"
                name="survey.awareOfSeniorDiscount"
                :value="false"
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
                :value="true"
              />
              <InputRadio
                v-model="formData.survey.hasTriedRecipeSuggestions"
                label="No"
                name="survey.hasTriedRecipeSuggestions"
                :value="false"
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
            <div>
              <h2>Deli Department</h2>
              <InputRow>
                <InputRadio
                  v-for="scale in ratingScale"
                  :key="scale.label"
                  v-model="formData.ratings.deli"
                  :label="scale.label"
                  name="ratings.deli"
                  :value="scale.value"
                />
              </InputRow>
            </div>

            <div>
              <h2>Meat Department</h2>
              <InputRow>
                <InputRadio
                  v-for="scale in ratingScale"
                  :key="scale.label"
                  v-model="formData.ratings.meat"
                  :label="scale.label"
                  name="ratings.meat"
                  :value="scale.value"
                />
              </InputRow>
            </div>

            <div>
              <h2>Seafood Department</h2>
              <InputRow>
                <InputRadio
                  v-for="scale in ratingScale"
                  :key="scale.label"
                  v-model="formData.ratings.seafood"
                  :label="scale.label"
                  name="ratings.seafood"
                  :value="scale.value"
                />
              </InputRow>
            </div>

            <div>
              <h2>Bakery Department</h2>
              <InputRow>
                <InputRadio
                  v-for="scale in ratingScale"
                  :key="scale.label"
                  v-model="formData.ratings.bakery"
                  :label="scale.label"
                  name="ratings.bakery"
                  :value="scale.value"
                />
              </InputRow>
            </div>

            <div>
              <h2>Dairy Department</h2>
              <InputRow>
                <InputRadio
                  v-for="scale in ratingScale"
                  :key="scale.label"
                  v-model="formData.ratings.dairy"
                  :label="scale.label"
                  name="ratings.dairy"
                  :value="scale.value"
                />
              </InputRow>
            </div>

            <div>
              <h2>Produce Department</h2>
              <InputRow>
                <InputRadio
                  v-for="scale in ratingScale"
                  :key="scale.label"
                  v-model="formData.ratings.produce"
                  :label="scale.label"
                  name="ratings.produce"
                  :value="scale.value"
                />
              </InputRow>
            </div>

            <div>
              <h2>Frozen Department</h2>
              <InputRow>
                <InputRadio
                  v-for="scale in ratingScale"
                  :key="scale.label"
                  v-model="formData.ratings.frozen"
                  :label="scale.label"
                  name="ratings.frozen"
                  :value="scale.value"
                />
              </InputRow>
            </div>

            <div>
              <h2>Floral Department</h2>
              <InputRow>
                <InputRadio
                  v-for="scale in ratingScale"
                  :key="scale.label"
                  v-model="formData.ratings.floral"
                  :label="scale.label"
                  name="ratings.floral"
                  :value="scale.value"
                />
              </InputRow>
            </div>

            <div>
              <h2>Were staff members helpful and courteous?</h2>
              <InputRow>
                <InputRadio
                  v-for="scale in ratingScale"
                  :key="scale.label"
                  v-model="formData.ratings.staff"
                  :label="scale.label"
                  name="ratings.staff"
                  :value="scale.value"
                />
              </InputRow>
            </div>

            <div>
              <h2>Did you get checked out quickly?</h2>
              <InputRow>
                <InputRadio
                  v-for="scale in ratingScale"
                  :key="scale.label"
                  v-model="formData.ratings.checkout"
                  :label="scale.label"
                  name="ratings.checkout"
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

      <Button type="submit"> Submit </Button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { string, object, array, boolean, number } from 'yup'
import { useForm } from 'vee-validate'

import { SurveyFormData } from '~~/types'

const ratingScale = [
  { label: 'Very Pleased', value: 5 },
  { label: 'Pleased', value: 4 },
  { label: 'Neither', value: 3 },
  { label: 'Disappointed', value: 2 },
  { label: 'Very Disappointed', value: 1 },
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
    wouldOrderOnline: boolean().nullable(),
    useCoupons: boolean().nullable(),
    awareOfSeniorDiscount: boolean().nullable(),
    hasTriedRecipeSuggestions: boolean().nullable(),
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

const onContactFormSubmit = handleSubmit(async (values) => {
  await $fetch('/api/forms/about', {
    method: 'post',
    body: values,
  })
})
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
