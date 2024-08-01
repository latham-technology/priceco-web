<template>
    <div>
        <PrimeToolbar class="mb-4">
            <template #start>
                <PrimeButtonGroup>
                    <PrimeButton
                        :disabled="selected.length === 0"
                        icon="pi pi-trash"
                        label="Delete"
                        severity="danger"
                        @click="handleDelete"
                    />
                </PrimeButtonGroup>
            </template>
            <template #end> </template>
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
                    v-model:selection="selected"
                    current-page-report-template="{first} to {last} of {totalRecords}"
                    data-key="id"
                    filter-display="row"
                    lazy
                    :loading="isLoading"
                    paginator
                    paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
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

                    <template #empty>
                        <p class="text-center">
                            No loyalty applications found
                        </p>
                    </template>

                    <PrimeColumn selection-mode="multiple" />
                    <!-- <PrimeColumn field="id" header="ID" sortable /> -->
                    <PrimeColumn
                        field="user.fullName"
                        header="Name"
                    />
                    <PrimeColumn field="user.email" header="Email" />
                    <PrimeColumn field="user.phone" header="Phone" />
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
                                        `/admin/loyalty/${slotProps.data.id}`,
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
    filters: {},
})
const isLoading = ref(false)
const tableData = ref([])
const selected = ref([])

const response = await useLazyFetch('/api/loyalty', {
    query: requestParams,
})

watch(
    [response.data, response.status],
    ([data, status]) => {
        tableData.value = data?.data.results || []
        isLoading.value = status === 'pending'
        selected.value = []
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
        orderKey: event.sortField,
        orderValue: event.sortOrder > 0 ? 'asc' : 'desc',
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
            selected.value.length === 1
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
                    updates: selected.value.map((application) => ({
                        id: application.id,
                        archived: true,
                    })),
                },
            })

            response.refresh()

            toast.add({
                severity: 'info',
                summary: 'Confirmed',
                detail: `${
                    selected.value.length === 1
                        ? 'Application'
                        : 'Applications'
                } archived`,
                life: 3000,
            })

            selected.value = []
        },
    })
}

function handleUnarchive() {
    confirm.require({
        message: `Are you sure you want to unarchive the selected ${
            selected.value.length === 1
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
                    updates: selected.value.map((application) => ({
                        id: application.id,
                        archived: false,
                    })),
                },
            })

            response.refresh()

            toast.add({
                severity: 'info',
                summary: 'Confirmed',
                detail: `${
                    selected.value.length === 1
                        ? 'Application'
                        : 'Applications'
                } unarchived`,
                life: 3000,
            })

            selected.value = []
        },
    })
}

function handleDelete() {
    confirm.require({
        message: `Are you sure you want to delete the selected ${
            selected.value.length === 1 ? 'submission' : 'submissions'
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
            await $fetch('/api/loyalty', {
                method: 'delete',
                body: {
                    updates: selected.value.map((loyalty) => ({
                        id: loyalty.id,
                    })),
                },
            })

            response.refresh()

            toast.add({
                severity: 'info',
                summary: 'Confirmed',
                detail: `${
                    selected.value.length === 1
                        ? 'Submission'
                        : 'Submissions'
                } deleted`,
                life: 3000,
            })

            selected.value = []
        },
    })
}
</script>

<style lang="scss" scoped></style>
