<template>
    <v-card>
        <v-card-title>
            <h1>
                {{ application.user.firstName }}
                {{ application.user.lastName }}
            </h1>
        </v-card-title>

        <v-card-text>
            <v-container>
                <v-row>
                    <v-col cols="12" md="6" sm="6">
                        <v-text-field
                            label="First Name"
                            :model-value="application.user.firstName"
                            readonly
                        />
                    </v-col>
                    <v-col cols="12" md="6" sm="6">
                        <v-text-field
                            label="Last Name"
                            :model-value="application.user.lastName"
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
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import type {
    Application,
    ApplicationEducation,
    ApplicationHistory,
    ApplicationReference,
    User,
} from '@prisma/client'

defineProps<{
    application: Application & {
        user: User
        history?: ApplicationHistory[]
        education: ApplicationEducation[]
        references: ApplicationReference[]
    }
}>()
</script>

<style scoped></style>
