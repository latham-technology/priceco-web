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
      <legend><h1>Contact Information</h1></legend>
      <InputRow>
        <InputText v-model="formData.contact.name" type="text" label="Name" />

        <InputText v-model="formData.contact.email" type="email" label="Email" />
      </InputRow>

      <InputRow>
        <InputSelect
          label="Select One"
          :options="[
            {
              label: 'option one',
              value: 'value one'
            },
            {
              label: 'option two',
              value: 'value two'
            }
          ]"
        >
          <template #extra>
            foo bar
          </template>
        </InputSelect>
      </InputRow>
    </form>
  </div>
</template>

<script setup lang="ts">
const formData = reactive({
  contact: {
    name: '',
    email: ''
  }
})

const onContactFormSubmit = (event) => {
  console.log(event)
}
</script>
