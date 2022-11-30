<template>
  <div>
    <PageTitle
      title="Contact Us"
      :images="[
        '/img/etc/services/servLg01.png',
        '/img/etc/services/contactSm01.jpg',
        '/img/etc/services/contactSm02.jpg',
      ]"
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
          <InputText v-model="formData.contact.name" type="text" label="Name" />

          <InputText
            v-model="formData.contact.email"
            type="email"
            label="Email"
          />

          <InputText
            v-model="formData.contact.phone"
            type="tel"
            label="Phone"
          />
        </InputRow>

        <h2>How may we contact you?</h2>
        <InputRow>
          <InputRadio
            v-model="formData.contact.preferredContactMethod"
            label="Email"
            value="email"
          />
          <InputRadio
            v-model="formData.contact.preferredContactMethod"
            label="Phone"
            value="phone"
          />
        </InputRow>
      </section>

      <section>
        <h1>Questionarrie</h1>
        <h2>At which store(s) do you normally shop?</h2>
        <InputRow>
          <div class="flex flex-col">
            <InputCheckbox
              v-model="formData.survey.shoppedStores"
              value="PriceCo Foods"
              label="PriceCo Foods"
            />
            <InputCheckbox
              v-model="formData.survey.shoppedStores"
              value="Safeway"
              label="Safeway"
            />
            <InputCheckbox
              v-model="formData.survey.shoppedStores"
              value="Savemart"
              label="Savemart"
            />
            <InputCheckbox
              v-model="formData.survey.shoppedStores"
              value="Cost-U-Less"
              label="Cost-U-Less"
            />
          </div>
        </InputRow>

        <h2>Would you use the internet to order items to pickup?</h2>
        <InputRow>
          <InputRadio
            v-model="formData.survey.wouldOrderOnline"
            label="Yes"
            :value="true"
          />
          <InputRadio
            v-model="formData.survey.wouldOrderOnline"
            label="No"
            :value="false"
          />
        </InputRow>

        <h2>Do you use coupons?</h2>
        <InputRow>
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
        </InputRow>

        <h2>Are you aware of our senior discounts?</h2>
        <InputRow>
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
        </InputRow>

        <h2>Have you tried our recipe suggestions?</h2>
        <InputRow>
          <InputRadio
            v-model="formData.survey.hasTriedRecipeSuggestions"
            label="Yes"
            :value="true"
          />
          <InputRadio
            v-model="formData.survey.hasTriedRecipeSuggestions"
            label="No"
            :value="false"
          />
        </InputRow>
      </section>

      <section id="survey">
        <h1>Survey</h1>

        <div class="flex flex-col gap-8">
          <div>
            <h2>Deli Department</h2>
            <InputRow>
              <InputRadio
                v-for="scale in ratingScale"
                :key="scale.label"
                v-model="formData.ratings.deli"
                :value="scale.value"
                :label="scale.label"
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
                :value="scale.value"
                :label="scale.label"
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
                :value="scale.value"
                :label="scale.label"
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
                :value="scale.value"
                :label="scale.label"
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
                :value="scale.value"
                :label="scale.label"
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
                :value="scale.value"
                :label="scale.label"
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
                :value="scale.value"
                :label="scale.label"
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
                :value="scale.value"
                :label="scale.label"
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
                :value="scale.value"
                :label="scale.label"
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
                :value="scale.value"
                :label="scale.label"
              />
            </InputRow>
          </div>
        </div>
      </section>

      <section>
        <InputRow>
          <InputTextarea
            v-model="formData.comments"
            label="Questions? Comments? Suggestions?"
          />
        </InputRow>
      </section>

      <Button type="submit"> Submit </Button>
    </form>
  </div>
</template>

<script setup lang="ts">
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

const onContactFormSubmit = async () => {
  await $fetch('/api/forms/about', {
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
