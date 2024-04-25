<template>
    <div class="flex">
        <form class="m-auto w-full md:w-1/2" @submit.prevent="login">
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
                            type="password"
                        />
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

const login = async () => {
    try {
        const result = await $fetch('/api/auth/login', {
            method: 'post',
            body: state.value,
        })

        if (result.data.id) {
            await navigateTo('/admin/')
        }
    } catch (error) {
        console.error(error)
    }
}
</script>

<style lang="scss" scoped></style>
