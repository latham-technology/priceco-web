<template>
  <div>
    <PageTitle
      :images="[
        '/img/etc/itemrequest/itemReqLg01.png',
        '/img/etc/itemrequest/itemReqSm01.png',
        '/img/etc/itemrequest/itemReqSm02.png',
      ]"
      title="New Item Request"
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
      <div class="grid grid-cols-2 gap-8">
        <section>
          <h1>Item Information</h1>

          <InputRow>
            <InputText
              v-model="formData.item.brand"
              label="Brand"
              name="item.brand"
            />
          </InputRow>
          <InputRow>
            <InputText
              v-model="formData.item.description"
              label="Description"
              name="item.description"
            />
          </InputRow>

          <InputRow>
            <InputText
              v-model="formData.item.size"
              label="Size"
              name="item.size"
            />
          </InputRow>
          <InputRow>
            <InputText
              v-model="formData.item.lastPurchased"
              label="Last Purchased At"
              name="item.lastPurchaded"
            />
          </InputRow>

          <InputRow>
            <InputTextarea
              v-model="formData.item.additionalInformation"
              label="Additional Information"
              name="item.additionalInformation"
            />
          </InputRow>
        </section>

        <section>
          <h1>Contact Information</h1>

          <InputRow>
            <InputText
              v-model="formData.contact.name"
              label="Name"
              name="contact.name"
            />
          </InputRow>
          <InputRow>
            <InputText
              v-model="formData.contact.phone"
              label="Phone Number"
              mask="(###) ###-####"
              name="contact.phone"
              type="tel"
            />
          </InputRow>
        </section>
      </div>

      <div class="flex gap-4 flex-col items-start">
        <Turnstile v-model="formData._turnstile" />
        <Button type="submit"> Submit </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { H3Error } from 'h3'
import { FetchError } from 'ofetch'
import { useForm } from 'vee-validate'
import { useToast } from 'vue-toastification'
import { object, string } from 'yup'
import { NewItemFormData } from '~~/types'

const toast = useToast()
const constants = useConstants()

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
  _turnstile: null,
})

const validationSchema = object().shape({
  contact: object().shape({
    name: string().required().label('Name'),
    phone: string().required().label('Phone Number'),
  }),
  item: object().shape({
    size: string().required().label('Size'),
    brand: string().required().label('Brand'),
    description: string(),
    lastPurchased: string(),
    additionalInformation: string(),
  }),
})

const { handleSubmit } = useForm({
  validationSchema,
  initialValues: formData,
})

const onSubmit = handleSubmit(
  async (values) => {
    try {
      await $fetch('/api/forms/new-item', {
        method: 'post',
        body: {
          ...values,
          _turnstile: formData._turnstile,
        },
      })

      toast.success(constants.APP_ITEM_ORDER_SUBMIT_SUCCESS)
    } catch (error) {
      toast.error((error as FetchError<H3Error>).message)
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
