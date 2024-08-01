<template>
    <div class="layout-topbar mb-8 flex justify-between items-center">
        <div class="topbar-start flex gap-4">
            <PrimeButton
                aria-label="Menu"
                icon="pi pi-bars"
                rounded
                type="button"
                @click="$emit('toggle-sidebar')"
            ></PrimeButton>
        </div>
        <div class="topbar-end">
            <PrimeButton
                aria-controls="user-menu"
                aria-haspopup="true"
                icon="pi pi-user"
                @click="toggleUserMenu"
            />

            <PrimeMenu
                id="user-menu"
                ref="userMenu"
                :model="userMenuItems"
                popup
            />
        </div>
    </div>
</template>

<script setup>
import PrimeButton from 'primevue/button'

defineEmits(['toggle-sidebar'])

const { session } = useAuth()
const userMenu = ref()

const userMenuItems = [
    {
        label: session.email,
        items: [
            {
                label: 'Log out',
                icon: 'pi pi-sign-out',
                command: authLogout,
            },
        ],
    },
]

const toggleUserMenu = (event) => {
    userMenu.value.toggle(event)
}
</script>

<style lang="scss" scoped></style>
