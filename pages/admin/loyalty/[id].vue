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
                        <p>{{ survey.useCoupons ? 'Yes' : 'No' }}</p>
                    </div>

                    <div>
                        <p class="font-bold">
                            Aware of Senior Discount
                        </p>
                        <p>
                            {{
                                survey.awareOfSeniorDiscount
                                    ? 'Yes'
                                    : 'No'
                            }}
                        </p>
                    </div>

                    <div>
                        <p class="font-bold">Referral</p>
                        <p>{{ survey.referral }}</p>
                    </div>

                    <div v-if="survey.comments" class="col-span-full">
                        <p class="font-bold">Comments</p>
                        <p>{{ survey.comments }}</p>
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

const confirm = useConfirm()
const toast = useToast()
const { $dayjs } = useNuxtApp()
const route = useRoute()

const loyalty = ref()

const response = await useFetch(`/api/loyalty/${route.params.id}`)

watch(
    response.data,
    (data) => {
        loyalty.value = data.data
    },
    {
        immediate: true,
    },
)

const survey = computed(() =>
    loyalty.value?.surveyJson
        ? JSON.parse(loyalty.value.surveyJson)
        : {},
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
</script>

<style scoped lang="scss">
:deep(.p-panel-title) {
    @apply text-xl;
}
</style>
