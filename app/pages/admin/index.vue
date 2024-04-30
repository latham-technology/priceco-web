<template>
    <div>
        <v-row>
            <v-col cols="sm" lg="4">
                <v-card
                    prepend-icon="mdi-file-document-multiple"
                    title="Applications"
                >
                    <v-card-actions>
                        <v-btn to="/admin/applications"
                            >View Applications</v-btn
                        >
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    auth: true,
    layout: 'admin',
})
</script>

<style lang="scss" scoped></style>
