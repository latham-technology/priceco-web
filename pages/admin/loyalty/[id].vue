<template>
    <div>
        <div class="flex mb-4 justify-between">
            <div></div>
            <div class="flex gap-2">
                <PrimeButton
                    icon="pi pi-trash"
                    label="Delete"
                    severity="danger"
                    @click="handleDelete"
                />
            </div>
        </div>

        <div class="flex flex-col gap-4">
            <PrimePanel header="Personal Information">
                <div
                    class="grid gap-8 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"
                >
                    <div>
                        <p class="font-bold">Full Name</p>
                        <p>{{ loyalty.user.fullName }}</p>
                    </div>

                    <div>
                        <p class="font-bold">Email</p>
                        <p>{{ loyalty.user.email }}</p>
                    </div>

                    <div>
                        <p class="font-bold">Phone Number</p>
                        <p>{{ loyalty.user.phone }}</p>
                    </div>

                    <div>
                        <p class="font-bold">Address</p>
                        <p>{{ loyalty.user.address1 }}</p>
                        <p v-if="loyalty.user.address2">
                            {{ loyalty.user.address2 }}
                        </p>
                        <p>
                            {{ loyalty.user.city }},
                            {{ loyalty.user.state }}
                            {{ loyalty.user.zip }}
                        </p>
                    </div>
                </div>
            </PrimePanel>

            <PrimePanel header="Survey Responses">
                <div
                    class="grid gap-8 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"
                >
                    <div>
                        <p class="font-bold">Uses Coupons</p>
                        <p>
                            {{
                                loyalty.surveyJson.useCoupons
                                    ? 'Yes'
                                    : 'No'
                            }}
                        </p>
                    </div>

                    <div>
                        <p class="font-bold">
                            Aware of Senior Discount
                        </p>
                        <p>
                            {{
                                loyalty.surveyJson
                                    .awareOfSeniorDiscount
                                    ? 'Yes'
                                    : 'No'
                            }}
                        </p>
                    </div>

                    <div>
                        <p class="font-bold">Referral</p>
                        <p>{{ loyalty.surveyJson.referral }}</p>
                    </div>

                    <div
                        v-if="loyalty.surveyJson.comments"
                        class="col-span-full"
                    >
                        <p class="font-bold">Comments</p>
                        <p>{{ loyalty.surveyJson.comments }}</p>
                    </div>
                </div>
            </PrimePanel>

            <PrimePanel header="Other Information">
                <div
                    class="grid gap-8 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"
                >
                    <div>
                        <p class="font-bold">Submitted</p>
                        <p>
                            {{
                                $dayjs(loyalty.createdAt).format(
                                    'MM/DD/YYYY h:mm a',
                                )
                            }}
                        </p>
                    </div>
                </div>
            </PrimePanel>

            <PrimePanel header="Actions">
                <div class="grid gap-8 grid-cols-1 md:grid-cols-2">
                    <form @submit.prevent="handleEmail">
                        <InputWrapper label="Email Application">
                            <template #input="{ props }">
                                <PrimeInputGroup>
                                    <PrimeInputText
                                        v-bind="props"
                                        v-model="email"
                                        :placeholder="
                                            config.mailgun.mailTo
                                        "
                                    />
                                    <PrimeButton type="submit"
                                        >Email</PrimeButton
                                    >
                                </PrimeInputGroup>
                            </template>
                        </InputWrapper>
                    </form>
                </div>
            </PrimePanel>
        </div>
    </div>
</template>

<script setup>
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

definePageMeta({
    auth: true,
    layout: 'admin',
})

const config = useRuntimeConfig().public
const confirm = useConfirm()
const toast = useToast()
const { $dayjs } = useNuxtApp()
const route = useRoute()

const loyalty = ref()
const email = ref()

const { data, status } = await useFetch(
    `/api/loyalty/${route.params.id}`,
)

if (status.value === 'success') {
    loyalty.value = data.value.data
}

watch(
    data,
    (data) => {
        loyalty.value = data.data
    },
    {
        immediate: true,
    },
)

function handleDelete() {
    confirm.require({
        header: 'Confirmation',
        message: 'Are you sure you want to delete this submission?',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true,
        },
        acceptProps: {
            label: 'Delete',
            severity: 'danger',
        },
        accept: async () => {
            try {
                await $fetch(`/api/loyalty/${route.params.id}`, {
                    method: 'delete',
                })

                toast.add({
                    life: 3000,
                    severity: 'info',
                    summary: 'Confirmed',
                    detail: 'Submissiond deleted',
                })

                navigateTo('/admin/loyalty')
            } catch (error) {}
        },
    })
}

async function handleEmail() {
    try {
        await $fetch(`/api/loyalty/${route.params.id}/email`, {
            method: 'post',
            body: {
                email: email.value || config.mailgun.mailTo,
            },
        })

        toast.add({
            severity: 'info',
            summary: 'Confirmed',
            detail: 'Application sent!',
            life: 3000,
        })
    } catch (error) {
        $sentry.captureException(error)

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not send. This error was logged, please try again later',
            life: 3000,
        })
    }
}
</script>

<style scoped lang="scss">
:deep(.p-panel-title) {
    @apply text-xl;
}
</style>
