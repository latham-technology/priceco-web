<template>
    <div>
        <div class="flex mb-4 justify-between">
            <PrimeButtonGroup>
                <PrimeConfirmPopup />
                <PrimeButton
                    icon="pi pi-box"
                    :label="
                        application.archived ? 'Unarchive' : 'Archive'
                    "
                    severity="secondary"
                    @click="handleArchive"
                />
                <PrimeButton
                    icon="pi pi-trash"
                    label="Delete"
                    severity="danger"
                    @click="handleDelete"
                />
            </PrimeButtonGroup>
            <div></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-4">
                <PrimePanel header="Personal Information">
                    <div class="flex flex-col">
                        <AdminFieldSet legend="Full Name">
                            {{ application.user.fullName }}
                        </AdminFieldSet>
                        <AdminFieldSet legend="Email">
                            <a
                                :href="`mailto:${application.user.email}`"
                                >{{ application.user.email }}</a
                            >
                        </AdminFieldSet>
                        <AdminFieldSet legend="Phone">
                            <a
                                :href="`tel:${application.user.phone}`"
                                >{{ application.user.phone }}</a
                            >
                        </AdminFieldSet>
                        <AdminFieldSet legend="Address">
                            <p>{{ application.user.address1 }}</p>
                            <p v-if="application.user.address2">
                                {{ application.user.address2 }}
                            </p>
                            <p>
                                {{ application.user.city }},
                                {{ application.user.state }}
                                {{ application.user.zip }}
                            </p>
                        </AdminFieldSet>
                    </div>
                </PrimePanel>
                <PrimePanel class="" header="Education">
                    <div
                        v-for="(
                            education, index
                        ) in application.education"
                        :key="education.id"
                        class="mb-4 last:mb-0"
                    >
                        <PrimeDivider />
                        <h1 class="font-bold">
                            {{
                                `${education.type
                                    .charAt(0)
                                    .toUpperCase()}${education.type.slice(
                                    1,
                                )} School`
                            }}
                        </h1>
                        <AdminFieldSet legend="Name">
                            {{ education.name }}
                        </AdminFieldSet>
                        <AdminFieldSet legend="Location">
                            {{ education.location }}
                        </AdminFieldSet>
                        <AdminFieldSet legend="Subjects">
                            {{ education.subjects }}
                        </AdminFieldSet>
                    </div>
                </PrimePanel>

                <PrimePanel class="" header="References">
                    <div
                        v-for="(
                            reference, index
                        ) in application.references"
                        :key="reference.id"
                        class="mb-4 last:mb-0"
                    >
                        <PrimeDivider />
                        <h1 class="font-bold">
                            {{ `Reference ${index + 1}` }}
                        </h1>
                        <AdminFieldSet legend="Name">
                            {{ reference.name }}
                        </AdminFieldSet>
                        <AdminFieldSet legend="Years Known">
                            {{ reference.yearsKnown }}
                        </AdminFieldSet>
                        <AdminFieldSet legend="Phone">
                            <a :href="`tel:${reference.phone}`">{{
                                reference.phone
                            }}</a>
                        </AdminFieldSet>
                        <AdminFieldSet legend="Address">
                            {{ reference.address }}
                        </AdminFieldSet>
                    </div>
                </PrimePanel>
            </div>
            <div class="flex flex-col gap-4">
                <PrimePanel header="Postion">
                    <AdminFieldSet legend="Date Available">
                        {{
                            $dayjs(application.dateAvailable).format(
                                'MM/DD/YYYY',
                            )
                        }}
                    </AdminFieldSet>
                    <AdminFieldSet legend="Availability">
                        {{ application.availability }}
                    </AdminFieldSet>
                    <AdminFieldSet legend="Position">
                        {{ application.positionDesired }}
                    </AdminFieldSet>
                    <AdminFieldSet legend="Salary">
                        {{ application.salaryDesired }}
                    </AdminFieldSet>
                </PrimePanel>

                <PrimePanel class="" header="Employment History">
                    <div
                        v-for="(
                            history, index
                        ) in application.history"
                        :key="history.id"
                        class="mb-4 last:mb-0"
                    >
                        <PrimeDivider />
                        <h1 class="font-bold">
                            {{ `Employer ${index + 1}` }}
                        </h1>
                        <AdminFieldSet legend="Company">
                            {{ history.companyName }}
                        </AdminFieldSet>
                        <AdminFieldSet legend="Title">
                            {{ history.positionTitle }}
                        </AdminFieldSet>
                        <AdminFieldSet legend="Location">
                            {{ history.companyLocation }}
                        </AdminFieldSet>
                        <AdminFieldSet legend="Dates Employed">
                            {{
                                history.positionDates
                                    .split(' - ')
                                    .map((date) =>
                                        $dayjs(date).format(
                                            'MM/DD/YYYY',
                                        ),
                                    )
                                    .join(' - ')
                            }}
                        </AdminFieldSet>
                    </div>
                </PrimePanel>
            </div>
        </div>

        <div>
            <PrimeTimeline :value="application.log">
                <template #opposite="{ item }">
                    {{
                        $dayjs(item.createdAt).format(
                            'MM/DD/YYYY h:mm',
                        )
                    }}
                </template>
                <template #content="{ item }">
                    <span class="capitalize">
                        {{ item.action.toLowerCase() }}
                    </span>
                </template>
            </PrimeTimeline>
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

const application = ref()

const response = await useFetch(
    `/api/applications/${route.params.id}`,
)

watch(
    response.data,
    (data) => {
        application.value = data.data
    },
    {
        immediate: true,
    },
)

function handleArchive(event) {
    confirm.require({
        target: event.currentTarget,
        message: `Are you sure you want to ${
            application.value.archived ? 'unarchive' : 'archive'
        } this application?`,
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true,
        },
        acceptProps: {
            label: application.value.archived
                ? 'Unarchive'
                : 'Archive',
            severity: 'warn',
        },
        accept: async () => {
            try {
                const result = await $fetch(
                    `/api/applications/${route.params.id}`,
                    {
                        method: 'put',
                        body: {
                            archived: !application.value.archived,
                        },
                    },
                )

                toast.add({
                    life: 3000,
                    severity: 'info',
                    summary: 'Confirmed',
                    detail: `Application ${
                        application.value.archived
                            ? 'unarchived'
                            : 'archived'
                    }`,
                })

                application.value = result.data
            } catch (error) {}
        },
    })
}

function handleDelete(event) {
    confirm.require({
        target: event.currentTarget,
        message: 'Are you sure you want to delete this application?',
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
                await $fetch(`/api/applications/${route.params.id}`, {
                    method: 'delete',
                })

                toast.add({
                    life: 3000,
                    severity: 'info',
                    summary: 'Confirmed',
                    detail: 'Application deleted',
                })

                navigateTo('/admin/applications')
            } catch (error) {}
        },
    })
}
</script>

<style scoped></style>
