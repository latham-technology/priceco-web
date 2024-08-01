<template>
    <div>
        <div class="flex mb-4 justify-between">
            <div></div>
            <div class="flex gap-2">
                <PrimeButton
                    icon="pi pi-box"
                    :label="
                        application.archived ? 'Unarchive' : 'Archive'
                    "
                    severity="warn"
                    @click="handleArchive"
                />
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
                        <p>{{ application.user.fullName }}</p>
                    </div>

                    <div>
                        <p class="font-bold">Email</p>
                        <p>{{ application.user.email }}</p>
                    </div>

                    <div>
                        <p class="font-bold">Phone Number</p>
                        <p>{{ application.user.phone }}</p>
                    </div>

                    <div>
                        <p class="font-bold">Address</p>
                        <p>{{ application.user.address1 }}</p>
                        <p v-if="application.user.address2">
                            {{ application.user.address2 }}
                        </p>
                        <p>
                            {{ application.user.city }},
                            {{ application.user.state }}
                            {{ application.user.zip }}
                        </p>
                    </div>
                </div>
            </PrimePanel>

            <PrimePanel header="Position Details">
                <div
                    class="grid gap-8 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"
                >
                    <div>
                        <p class="font-bold">Position Desired</p>
                        <p>{{ application.positionDesired }}</p>
                    </div>

                    <div>
                        <p class="font-bold">Date Available</p>
                        <p>
                            {{
                                $dayjs(
                                    application.dateAvailable,
                                ).format('MM/DD/YYYY')
                            }}
                        </p>
                    </div>

                    <div>
                        <p class="font-bold">Availability</p>
                        <p class="capitalize">
                            {{ application.availability }}
                        </p>
                    </div>

                    <div>
                        <p class="font-bold">Compensation Desired</p>
                        <p>
                            ${{
                                application.salaryDesired.toFixed(2)
                            }}
                            per hour
                        </p>
                    </div>

                    <div>
                        <p class="font-bold">Currently Employed</p>
                        <p>
                            {{
                                application.currentlyEmployed
                                    ? 'Yes'
                                    : 'No'
                            }}
                        </p>
                    </div>
                </div>
            </PrimePanel>

            <PrimePanel header="Education Details">
                <ul>
                    <li
                        v-for="(
                            education, index
                        ) in sortedEducationHistory"
                        :key="`education-${education.id}`"
                    >
                        <div
                            class="grid gap-8 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"
                        >
                            <div>
                                <p class="font-bold">Name</p>
                                <p>{{ education.name }}</p>
                            </div>

                            <div>
                                <p class="font-bold">Type</p>
                                <p class="capitalize">
                                    {{ education.type }}
                                </p>
                            </div>

                            <div>
                                <p class="font-bold">Location</p>
                                <p>{{ education.location }}</p>
                            </div>

                            <div>
                                <p class="font-bold">Subjects</p>
                                <p>{{ education.subjects }}</p>
                            </div>

                            <div>
                                <p class="font-bold">Completed</p>
                                <p>
                                    {{
                                        education.completed
                                            ? 'Yes'
                                            : 'No'
                                    }}
                                </p>
                            </div>
                        </div>

                        <PrimeDivider
                            v-if="
                                index !==
                                application.education.length - 1
                            "
                        />
                    </li>
                </ul>
            </PrimePanel>

            <PrimePanel header="Employment Details">
                <ul>
                    <li
                        v-for="(
                            history, index
                        ) in sortedEmploymentHistory"
                        :key="`history-${history.id}`"
                    >
                        <div
                            class="grid gap-8 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"
                        >
                            <div>
                                <p class="font-bold">Employer Name</p>
                                <p>{{ history.companyName }}</p>
                            </div>

                            <div>
                                <p class="font-bold">Title</p>
                                <p>{{ history.positionTitle }}</p>
                            </div>

                            <div>
                                <p class="font-bold">Location</p>
                                <p>
                                    {{ history.companyLocation }}
                                </p>
                            </div>

                            <div>
                                <p class="font-bold">
                                    Employment Date
                                </p>
                                <p>
                                    {{
                                        $dayjs(
                                            history.positionDates[0],
                                        ).format('MM/DD/YYYY')
                                    }}
                                    -
                                    {{
                                        $dayjs(
                                            history.positionDates[1],
                                        ).format('MM/DD/YYYY')
                                    }}
                                </p>
                            </div>
                        </div>

                        <PrimeDivider
                            v-if="
                                index !==
                                application.history.length - 1
                            "
                        />
                    </li>
                </ul>
            </PrimePanel>

            <PrimePanel header="References">
                <ul>
                    <li
                        v-for="(
                            reference, index
                        ) in application.references"
                        :key="`reference-${reference.id}`"
                    >
                        <div
                            class="grid gap-8 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"
                        >
                            <div>
                                <p class="font-bold">Name</p>
                                <p>{{ reference.name }}</p>
                            </div>

                            <div>
                                <p class="font-bold">Phone Number</p>
                                <p>{{ reference.phone }}</p>
                            </div>

                            <div>
                                <p class="font-bold">Years Known</p>
                                <p>
                                    {{ reference.yearsKnown }}
                                </p>
                            </div>

                            <div>
                                <p class="font-bold">Address</p>
                                <p>
                                    {{ reference.address }}
                                </p>
                            </div>
                        </div>

                        <PrimeDivider
                            v-if="
                                index !==
                                application.references.length - 1
                            "
                        />
                    </li>
                </ul>
            </PrimePanel>

            <PrimePanel header="Other Information">
                <div
                    class="grid gap-8 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"
                >
                    <div>
                        <p class="font-bold">Application Submitted</p>
                        <p>
                            {{
                                $dayjs(application.createdAt).format(
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

const sortedEmploymentHistory = computed(() => {
    return (
        application.value.history.sort((a, b) => {
            return (
                new Date(a.positionDates[0]) -
                new Date(b.positionDates[0])
            )
        }) || []
    )
})

const sortedEducationHistory = computed(() => {
    return (
        application.value.education.sort((a) => {
            return a.type === 'primary' ? -1 : 1
        }) || []
    )
})

function handleArchive() {
    confirm.require({
        header: 'Confirmation',
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

function handleDelete() {
    confirm.require({
        header: 'Confirmation',
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

<style scoped lang="scss">
:deep(.p-panel-title) {
    @apply text-xl;
}
</style>
