<template>
    <div>
        <v-container>
            <v-row>
                <v-col cols="12" md="6" sm="6">
                    <v-text-field
                        label="Name"
                        :model-value="fullName"
                        readonly
                    />
                </v-col>

                <v-col cols="12" md="6" sm="6">
                    <v-text-field
                        label="Phone Number"
                        :model-value="application.user.phone"
                        readonly
                    />
                </v-col>

                <v-col cols="12" md="6" sm="6">
                    <v-text-field
                        label="Email"
                        :model-value="application.user.email"
                        readonly
                    />
                </v-col>

                <v-col cols="12">
                    <v-text-field
                        label="Address 1"
                        :model-value="application.user.address1"
                        readonly
                    />
                </v-col>

                <v-col v-if="application.user.address2" cols="12">
                    <v-text-field
                        label="Address 2"
                        :model-value="application.user.address2"
                        readonly
                    />
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'admin',
})

const route = useRoute()
const application = ref()

const { data } = await useFetch(
    `/api/applications/${route.params.id}`,
)

application.value = data.value.data

const fullName = computed(
    () =>
        `${application.value.user.firstName} ${application.value.user.lastName}`,
)
</script>

<style scoped></style>
