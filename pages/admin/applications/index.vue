<template>
    <div>
        <PrimeToolbar class="mb-4">
            <template #start>
                <PrimeButtonGroup>
                    <PrimeButton
                        v-if="requestParams.filters.archived[0]"
                        :disabled="selectedApplications.length === 0"
                        icon="pi pi-box"
                        label="Unarchive"
                        severity="warn"
                        @click="handleUnarchive"
                    />
                    <PrimeButton
                        v-else
                        :disabled="selectedApplications.length === 0"
                        icon="pi pi-box"
                        label="Archive"
                        severity="warn"
                        @click="handleArchive"
                    />
                    <PrimeButton
                        :disabled="selectedApplications.length === 0"
                        icon="pi pi-trash"
                        label="Delete"
                        severity="danger"
                        @click="handleDelete"
                    />
                </PrimeButtonGroup>
            </template>
            <template #end>
                <div class="flex items-center gap-2">
                    <PrimeSelectButton
                        v-model="requestParams.filters.archived[0]"
                        option-label="label"
                        option-value="value"
                        :options="[
                            { label: 'Open', value: false },
                            { label: 'Archived', value: true },
                        ]"
                    />
                </div>
            </template>
        </PrimeToolbar>

        <PrimeCard
            class="overflow-hidden"
            :pt="{
                body: {
                    style: {
                        padding: 0,
                    },
                },
            }"
        >
            <template #content>
                <PrimeDataTable
                    v-model:filters="filters"
                    v-model:selection="selectedApplications"
                    current-page-report-template="{first} to {last} of {totalRecords}"
                    data-key="id"
                    filter-display="row"
                    lazy
                    :loading="isLoading"
                    paginator
                    paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    :rows="10"
                    :rows-per-page-options="[10, 50, 100]"
                    striped-rows
                    :total-records="tableCount"
                    :value="tableData"
                    @filter="onFilter"
                    @page="onPage"
                    @sort="onSort"
                >
                    <template #paginatorstart>
                        <PrimeButton
                            icon="pi pi-refresh"
                            text
                            type="button"
                            @click="response.refresh"
                        />
                    </template>
                    <template #paginatorend></template>

                    <template #empty>No applications found</template>

                    <PrimeColumn selection-mode="multiple" />
                    <PrimeColumn field="id" header="ID" sortable />
                    <PrimeColumn
                        field="user.fullName"
                        header="Name"
                        :show-filter-menu="false"
                    >
                        <template
                            #filter="{ filterModel, filterCallback }"
                        >
                            <PrimeInputText
                                v-model="filterModel.value"
                                placeholder="Search by name"
                                type="text"
                                @input="filterCallback"
                            />
                        </template>
                    </PrimeColumn>
                    <PrimeColumn
                        field="positionDesired"
                        header="Position"
                        :show-filter-menu="false"
                    >
                        <template
                            #filter="{ filterModel, filterCallback }"
                        >
                            <PrimeInputText
                                v-model="filterModel.value"
                                placeholder="Search by position"
                                type="text"
                                @input="filterCallback"
                            />
                        </template>
                    </PrimeColumn>
                    <PrimeColumn
                        field="salaryDesired"
                        header="Salary"
                        sortable
                    />
                    <PrimeColumn
                        field="availability"
                        header="Availability"
                        sortable
                    />
                    <PrimeColumn
                        field="createdAt"
                        header="Submitted"
                        sortable
                    >
                        <template #body="{ data }">
                            {{
                                useNuxtApp()
                                    .$dayjs(data.createdAt)
                                    .format('MM/DD/YYYY h:mm a')
                            }}
                        </template>
                    </PrimeColumn>
                    <PrimeColumn>
                        <template #body="slotProps">
                            <PrimeButton
                                v-tooltip="'View'"
                                icon="pi pi-eye"
                                rounded
                                severity="secondary"
                                @click="
                                    navigateTo(
                                        `/admin/applications/${slotProps.data.id}`,
                                    )
                                "
                            />
                        </template>
                    </PrimeColumn>
                </PrimeDataTable>
            </template>
        </PrimeCard>
    </div>
</template>

<script setup>
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode } from '@primevue/core/api'
import _debounce from 'lodash.debounce'

definePageMeta({
    auth: true,
    layout: 'admin',
})

const confirm = useConfirm()
const toast = useToast()

const requestParams = ref({
    page: 0,
    perPage: 10,
    orderKey: 'createdAt',
    orderValue: 'desc',
    filters: {
        archived: [false],
    },
})
const isLoading = ref(false)
const tableData = ref([])
const selectedApplications = ref([])
const filters = ref({
    'user.fullName': {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
    },
    'positionDesired': {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
    },
})

const response = await useLazyFetch('/api/applications', {
    query: requestParams,
})

watch(
    [response.data, response.status],
    ([data, status]) => {
        tableData.value = data?.data.results || []
        isLoading.value = status === 'pending'
        selectedApplications.value = []
    },
    { immediate: true },
)

const tableCount = computed(() => response.data.value?.data.count)

function onPage(event) {
    updateRequestParams({
        page: event.page,
        perPage: event.rows,
    })
}

function onSort(event) {
    updateRequestParams({
        orderBy: event.sortField,
        sort: event.sortOrder > 0 ? 'asc' : 'desc',
    })
}

const onFilter = _debounce((event) => {
    const filters = event.filters

    for (const key in filters) {
        updateRequestParams({
            filters: {
                [key]: [filters[key].value],
            },
        })
    }
}, 500)

function updateRequestParams(params = {}) {
    requestParams.value = {
        ...requestParams.value,
        ...params,
        filters: {
            ...requestParams.value.filters,
            ...(params.filters || {}),
        },
    }
}

function handleArchive() {
    confirm.require({
        message: `Are you sure you want to archive the selected ${
            selectedApplications.value.length === 1
                ? 'application'
                : 'applications'
        }?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true,
        },
        acceptProps: {
            label: 'Archive',
        },
        accept: async () => {
            await $fetch('/api/applications', {
                method: 'put',
                body: {
                    updates: selectedApplications.value.map(
                        (application) => ({
                            id: application.id,
                            archived: true,
                        }),
                    ),
                },
            })

            response.refresh()

            toast.add({
                severity: 'info',
                summary: 'Confirmed',
                detail: `${
                    selectedApplications.value.length === 1
                        ? 'Application'
                        : 'Applications'
                } archived`,
                life: 3000,
            })

            selectedApplications.value = []
        },
    })
}

function handleUnarchive() {
    confirm.require({
        message: `Are you sure you want to unarchive the selected ${
            selectedApplications.value.length === 1
                ? 'application'
                : 'applications'
        }?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true,
        },
        acceptProps: {
            label: 'Unrchive',
        },
        accept: async () => {
            await $fetch('/api/applications', {
                method: 'put',
                body: {
                    updates: selectedApplications.value.map(
                        (application) => ({
                            id: application.id,
                            archived: false,
                        }),
                    ),
                },
            })

            response.refresh()

            toast.add({
                severity: 'info',
                summary: 'Confirmed',
                detail: `${
                    selectedApplications.value.length === 1
                        ? 'Application'
                        : 'Applications'
                } unarchived`,
                life: 3000,
            })

            selectedApplications.value = []
        },
    })
}

function handleDelete() {
    confirm.require({
        message: `Are you sure you want to delete the selected ${
            selectedApplications.value.length === 1
                ? 'application'
                : 'applications'
        }?`,
        header: 'Confirmation',
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
            await $fetch('/api/applications', {
                method: 'delete',
                body: {
                    updates: selectedApplications.value.map(
                        (application) => ({
                            id: application.id,
                        }),
                    ),
                },
            })

            response.refresh()

            toast.add({
                severity: 'info',
                summary: 'Confirmed',
                detail: `${
                    selectedApplications.value.length === 1
                        ? 'Application'
                        : 'Applications'
                } deleted`,
                life: 3000,
            })

            selectedApplications.value = []
        },
    })
}
</script>

<style lang="scss" scoped></style>
