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
      The PriceCo Foods management and staff strive to provide customers with a wonderful store in which to shop, featuring a uniqueness and competitive pricing not normally found in your local supermarket. Our goal is to give you, the customer, a wonderful shopping experience each and every time they shop, and to provide them with those unique and/or signature items found only in our store! Please contact us to let us know how we're doing. We exist to serve you. We want to know how we can improve your shopping experience.
    </AppTypography>

    <div class="flex justify-between gap-2">
      <div class="flex flex-col gap-1">
        <h2 class="font-serif font-bold border-b border-solid">
          Address
        </h2>
        <a class="text-link" href="https://goo.gl/maps/yznsfXefHP6ayLDX9">
          <p>13765 Mono Way</p>
          <p>Sonora, CA 95370</p>
        </a>
      </div>

      <div class="flex flex-col gap-1">
        <h2 class="font-serif font-bold border-b border-solid">
          Hours of Operation
        </h2>
        <p class="font-bold">
          Monday - Saturday
        </p>
        <p>7:00 am - 9:00 pm</p>
        <p class="font-bold">
          Sunday
        </p>
        <p>8:00 am - 9:00 pm</p>
      </div>

      <div class="flex flex-col gap-1">
        <h2 class="font-serif font-bold border-b border-solid">
          Phone
        </h2>
        <a class="text-link" href="tel:2095324343">(209) 532-4343</a>
      </div>
    </div>

    <form @submit.prevent="onContactFormSubmit">
      <section>
        <h1>Contact Information</h1>

        <InputRow>
          <InputText v-model="formData.contact.name" type="text" label="Name" />

          <InputText v-model="formData.contact.email" type="email" label="Email" />

          <InputText v-model="formData.contact.phone" type="tel" label="Phone" />
        </InputRow>

        <h2>How may we contact you?</h2>
        <InputRow>
          <InputRadio v-model="formData.contact.method" label="Email" value="email" />
          <InputRadio v-model="formData.contact.method" label="Phone" value="phone" />
        </InputRow>
      </section>

      <section>
        <h1>Questionarrie</h1>
        <label>At which store(s) do you normally shop?</label>
        <InputRow>
          <div class="flex flex-col">
            <InputCheckbox v-model="formData.survey.shoppedStores" value="PriceCo Foods" label="PriceCo Foods" />
            <InputCheckbox v-model="formData.survey.shoppedStores" value="Safeway" label="Safeway" />
            <InputCheckbox v-model="formData.survey.shoppedStores" value="Savemart" label="Savemart" />
            <InputCheckbox v-model="formData.survey.shoppedStores" value="Cost-U-Less" label="Cost-U-Less" />
          </div>
        </InputRow>

        <label>Would you use the internet to order items to pickup?</label>
        <InputRow>
          <InputRadio v-model="formData.survey.orderPickup" label="Yes" :value="true" />
          <InputRadio v-model="formData.survey.orderPickup" label="No" :value="false" />
        </InputRow>

        <label>Do you use coupons?</label>
        <InputRow>
          <InputRadio v-model="formData.survey.useCoupons" label="Yes" :value="true" />
          <InputRadio v-model="formData.survey.useCoupons" label="No" :value="false" />
        </InputRow>

        <label>Are you aware of our senior discounts?</label>
        <InputRow>
          <InputRadio v-model="formData.survey.awareOfSeniorDiscount" label="Yes" :value="true" />
          <InputRadio v-model="formData.survey.awareOfSeniorDiscount" label="No" :value="false" />
        </InputRow>

        <label>Have you tried our recipe suggestions?</label>
        <InputRow>
          <InputRadio v-model="formData.survey.hasTriedRecipeSuggestions" label="Yes" :value="true" />
          <InputRadio v-model="formData.survey.hasTriedRecipeSuggestions" label="No" :value="false" />
        </InputRow>
      </section>

      <section>
        <h1>Survey</h1>

        <label>Deli Department</label>
        <InputRow>
          <InputRadio v-for="i in 5" :key="i" v-model="formData.ratings.deli" :value="i" :label="`${i}`" />
        </InputRow>

        <label>Meat Department</label>
        <InputRow>
          <InputRadio v-for="i in 5" :key="i" v-model="formData.ratings.meat" :value="i" :label="`${i}`" />
        </InputRow>

        <label>Seafood Department</label>
        <InputRow>
          <InputRadio v-for="i in 5" :key="i" v-model="formData.ratings.seafood" :value="i" :label="`${i}`" />
        </InputRow>

        <label>Bakery Department</label>
        <InputRow>
          <InputRadio v-for="i in 5" :key="i" v-model="formData.ratings.bakery" :value="i" :label="`${i}`" />
        </InputRow>

        <label>Dairy Department</label>
        <InputRow>
          <InputRadio v-for="i in 5" :key="i" v-model="formData.ratings.dairy" :value="i" :label="`${i}`" />
        </InputRow>

        <label>Produce Department</label>
        <InputRow>
          <InputRadio v-for="i in 5" :key="i" v-model="formData.ratings.produce" :value="i" :label="`${i}`" />
        </InputRow>

        <label>Frozen Department</label>
        <InputRow>
          <InputRadio v-for="i in 5" :key="i" v-model="formData.ratings.frozen" :value="i" :label="`${i}`" />
        </InputRow>

        <label>Floral Department</label>
        <InputRow>
          <InputRadio v-for="i in 5" :key="i" v-model="formData.ratings.floral" :value="i" :label="`${i}`" />
        </InputRow>

        <label>Are staff members helpful and courteous?</label>
        <InputRow>
          <InputRadio v-for="i in 5" :key="i" v-model="formData.ratings.staff" :value="i" :label="`${i}`" />
        </InputRow>

        <label>Did you get checked out quickly?</label>
        <InputRow>
          <InputRadio v-for="i in 5" :key="i" v-model="formData.ratings.checkout" :value="i" :label="`${i}`" />
        </InputRow>
      </section>

      <section>
        <InputRow>
          <InputTextarea v-model="formData.comments" label="Comments" />
        </InputRow>
      </section>
    </form>
  </div>
</template>

<script setup lang="ts">
const formData = reactive({
  contact: {
    name: '',
    email: '',
    phone: '',
    method: ''
  },
  survey: {
    shoppedStores: [],
    orderPickup: null,
    useCoupons: null,
    awareOfSeniorDiscount: null,
    hasTriedRecipeSuggestions: null
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
    checkout: null
  },
  comments: ''
})

const onContactFormSubmit = (event) => {
  console.log(event)
}
</script>
