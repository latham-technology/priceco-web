<template>
    <div>
        <PrimeToolbar>
            <template #start>
                <PrimeButton
                    :disabled="selectedApplications.length === 0"
                    icon="pi pi-box"
                    label="Archive"
                    severity="warn"
                    @click="handleArchive"
                />
            </template>
            <template #end>
                <PrimeCheckbox
                    v-model="requestParams.archived"
                    binary
                    input-id="archived"
                />
                <label for="archived">Show Archived</label>
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
                    v-model:selection="selectedApplications"
                    current-page-report-template="{first} to {last} of {totalRecords}"
                    lazy
                    :loading="isLoading"
                    paginator
                    paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    :rows="10"
                    :rows-per-page-options="[10, 50, 100]"
                    striped-rows
                    :total-records="tableCount"
                    :value="tableData"
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

                    <PrimeColumn selection-mode="multiple" />
                    <PrimeColumn field="id" header="ID" sortable />
                    <PrimeColumn
                        field="user.fullName"
                        header="Name"
                    />
                    <PrimeColumn
                        field="positionDesired"
                        header="Position"
                    />
                    <PrimeColumn
                        field="salaryDesired"
                        header="Salary"
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

definePageMeta({
    auth: true,
    layout: 'admin',
})

const confirm = useConfirm()
const toast = useToast()

const requestParams = ref({
    page: 0,
    perPage: 10,
    orderBy: 'createdAt',
    sort: 'desc',
    archived: false,
})
const isLoading = ref(false)
const tableData = ref([])
const selectedApplications = ref([])

const response = await useLazyFetch('/api/applications', {
    query: requestParams,
})

watch(
    [response.data, response.status],
    ([data, status]) => {
        tableData.value = data?.data.results || []
        isLoading.value = status === 'pending'
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

function updateRequestParams(params) {
    requestParams.value = {
        ...requestParams.value,
        ...params,
    }
}

function handleArchive() {
    confirm.require({
        message:
            'Are you sure you want to archive the selected applications?',
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
                life: 3000,
            })
        },
    })
}
</script>

<style lang="scss" scoped></style>
