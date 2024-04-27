<template>
    <div class="flex h-full p-4">
        <form
            class="m-auto w-full md:w-1/2"
            @submit.prevent="authLogin(state.email, state.password)"
        >
            <v-card title="Admin Login">
                <template #text>
                    <div>
                        <v-text-field
                            v-model="state.email"
                            label="Email"
                            required
                            type="email"
                        />

                        <v-text-field
                            v-model="state.password"
                            label="Password"
                            required
                            :type="showPassword ? 'text' : 'password'"
                        >
                            <template #append-inner>
                                <v-btn
                                    density="comfortable"
                                    :icon="
                                        showPassword
                                            ? 'mdi-eye-off'
                                            : 'mdi-eye'
                                    "
                                    size="small"
                                    @click="
                                        showPassword = !showPassword
                                    "
                                ></v-btn>
                            </template>
                        </v-text-field>
                    </div>
                </template>

                <template #actions>
                    <v-btn
                        class="w-full"
                        type="submit"
                        variant="tonal"
                        >Login</v-btn
                    >
                </template>
            </v-card>
        </form>
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'admin',
})

const state = ref({
    email: '',
    password: '',
})
const showPassword = ref(false)
</script>

<style lang="scss" scoped></style>
