<template>
  <div>
    <PageTitle
      title="New Item Request"
      :images="[
        '/img/etc/itemrequest/itemReqLg01.png',
        '/img/etc/itemrequest/itemReqSm01.png',
        '/img/etc/itemrequest/itemReqSm02.png',
      ]"
    />

    <AppTypography>
      Want an item seen elsewhere? Fill out the form below and we will do our
      very best to provide it for you. Please allow for up to 10 days for
      delivery to the store, if available.
    </AppTypography>

    <AppTypography>
      We will contact you by phone regarding the status of your order. Thank
      you!
    </AppTypography>

    <form @submit.prevent="onSubmit">
      <section>
        <h1>Contact Information</h1>

        <InputRow>
          <InputText v-model="formData.contact.name" label="Name" />
          <InputText
            v-model="formData.contact.phone"
            type="tel"
            label="Phone Number"
          />
        </InputRow>
      </section>

      <section>
        <h1>Item Information</h1>

        <InputRow>
          <InputText v-model="formData.item.brand" label="Brand" />
          <InputText v-model="formData.item.description" label="Description" />
        </InputRow>

        <InputRow>
          <InputText v-model="formData.item.size" label="Size" />
          <InputText
            v-model="formData.item.lastPurchased"
            label="Last Purchased At"
          />
        </InputRow>

        <InputRow>
          <InputTextarea
            v-model="formData.item.additionalInformation"
            label="Additional Information"
          />
        </InputRow>
      </section>
    </form>
  </div>
</template>

<script setup lang="ts">
import { NewItemFormData } from '~~/types'

const formData = reactive<NewItemFormData>({
  contact: {
    name: '',
    phone: '',
  },
  item: {
    size: '',
    brand: '',
    description: '',
    lastPurchased: '',
    additionalInformation: '',
  },
})

const onSubmit = async () => {
  await $fetch('/api/forms/new-item', {
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
