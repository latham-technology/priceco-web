<template>
    <div
        class="layout-sidebar flex flex-col w-60 h-full shadow-lg bg-white"
    >
        <div
            class="sidebar-header py-10 px-5 flex justify-center items-center"
        >
            <NuxtLink to="/admin">
                <NuxtImg
                    alt="PriceCo Foods"
                    class="object-contain"
                    src="/img/logo.png"
                    width="313"
                />
            </NuxtLink>
        </div>

        <div class="layout-menu-container overflow-auto flex-1 pb-8">
            <PrimePanelMenu :model="items" />
        </div>
    </div>
</template>

<script setup>
const route = useRoute()

const items = computed(() => [
    {
        label: 'Applications',
        icon: 'pi pi-file',
        command: () => navigateTo('/admin/applications'),
        class: {
            'font-bold': route.path === '/admin/applications',
        },
    },
    {
        label: 'Loyalty',
        icon: 'pi pi-id-card',
        command: () => navigateTo('/admin/loyalty'),
        class: {
            'font-bold': route.path === '/admin/loyalty',
        },
    },
])
</script>

<style lang="scss" scoped>
:deep(.p-panelmenu-panel) {
    border: none;
}
</style>
