<template>
    <div class="flex h-full p-4">
        <form
            class="m-auto max-w-sm md:w-[384px]"
            @submit.prevent="handleLogin"
        >
            <PrimePanel header="Admin Login">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col">
                        <label for="email">Email</label>
                        <PrimeInputText
                            id="email"
                            v-model="state.email"
                            fluid
                            :invalid="state.error"
                            required
                            type="email"
                        />
                    </div>

                    <div class="flex flex-col">
                        <label for="password">Password</label>
                        <PrimePassword
                            id="password"
                            v-model="state.password"
                            :feedback="false"
                            fluid
                            :input-props="{
                                autocomplete: 'current-password',
                            }"
                            :invalid="state.error"
                            required
                            toggle-mask
                        />
                    </div>

                    <PrimeMessage
                        v-if="state.error"
                        severity="error"
                        >{{ state.error }}</PrimeMessage
                    >
                </div>

                <template #footer>
                    <PrimeButton
                        class="w-full"
                        label="Login"
                        type="submit"
                        >Login</PrimeButton
                    >
                </template>
            </PrimePanel>
        </form>
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'admin-login',
})

const state = ref({
    email: '',
    password: '',
    error: false,
})

watch(state, () => {
    state.value.error = false
})

const handleLogin = async () => {
    try {
        await authLogin(state.value.email, state.value.password)
    } catch (error) {
        if (error.data.code === 401) {
            state.value.error =
                'Failed to login. Please check your email and password and try again.'
        }
    }
}
</script>

<style lang="scss" scoped></style>
