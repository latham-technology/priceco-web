<template>
    <v-data-table-server
        :headers="headers"
        :items="data.data"
        :items-length="data.data.length"
        :loading="pending"
    >
        <template #item.actions="{ item: application }">
            <v-dialog max-width="500">
                <template #activator="{ props: activatorProps }">
                    <v-btn
                        icon="mdi-eye"
                        size="small"
                        variant="text"
                        v-bind="activatorProps"
                    />
                </template>

                <AdminApplicationDetails :application="application" />
            </v-dialog>

            <v-dialog max-width="500">
                <template #activator="{ props: activatorProps }">
                    <v-btn
                        v-bind="activatorProps"
                        color="red"
                        icon="mdi-trash-can"
                        size="small"
                        variant="text"
                    />
                </template>

                <template #default="{ isActive }">
                    <v-card title="Delete Application">
                        <v-card-text
                            >You are deleting the application from
                            {{ item.name }}</v-card-text
                        >

                        <v-card-actions>
                            <v-btn @click="isActive.value = false">
                                Cancel
                            </v-btn>
                            <v-spacer />
                            <v-btn
                                append-icon="mdi-trash-can"
                                color="red"
                                @click="onDelete(item.id)"
                            >
                                Delete
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </template>
            </v-dialog>
        </template>
    </v-data-table-server>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

definePageMeta({
    auth: true,
    layout: 'admin',
})

const headers = [
    {
        title: 'ID',
        key: 'id',
    },
    {
        title: 'Name',
        key: 'firstName',
        value: (item) =>
            `${item.user.firstName} ${item.user.lastName}`,
    },
    {
        title: 'Created At',
        key: 'createdAt',
        value: (item) =>
            dayjs(item.createdAt).format('M/DD/YY h:mm a'),
    },
    {
        title: 'Available At',
        key: 'dateAvailable',
    },
    {
        title: 'Position',
        key: 'positionDesired',
    },
    {
        title: 'Salary',
        key: 'salaryDesired',
    },
    {
        title: 'Availability',
        key: 'availability',
        value: (item) =>
            item.availability === 'full' ? 'Full-time' : 'Part-time',
    },
    {
        title: 'Actions',
        key: 'actions',
    },
]

const { data, pending } = await useFetch(`/api/applications`)

const onDelete = (id: number) => {
    try {
        $fetch(`/api/applications/${id}`, {
            method: 'DELETE',
        })
    } catch (error) {
        console.log(error)
    }
}
</script>

<style lang="scss" scoped></style>
