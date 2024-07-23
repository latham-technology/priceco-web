<template>
    <div
        :class="{
            'sidebar-open': isSidebarOpen,
        }"
    >
        <AdminLayoutSidebar />

        <div class="layout-content-wrapper">
            <AdminLayoutTopbar @toggle-sidebar="onToggleSidebar" />

            <div class="breadcrumb mb-8 px-2 lg:hidden">
                breadcrumbs
            </div>

            <div>
                <slot />
            </div>

            <TransitionFade>
                <div
                    v-if="isSidebarOpen"
                    class="layout-mask"
                    @click="isSidebarOpen = false"
                ></div>
            </TransitionFade>
        </div>

        <PrimeToast />
        <PrimeConfirmDialog />
    </div>
</template>

<script setup lang="ts">
import 'primeicons/primeicons.css'

const isSidebarOpen = ref(false)

const onToggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<style scoped lang="scss">
.layout-content-wrapper {
    @apply lg:ml-60 p-4 lg:p-8 transition-[margin-left];

    .sidebar-open & {
        @apply lg:ml-0;
    }
}

.layout-sidebar {
    @apply -translate-x-full lg:translate-x-0 transition-transform fixed top-0 left-0 z-20;

    .sidebar-open & {
        @apply translate-x-0 lg:-translate-x-full;
    }
}

.layout-mask {
    @apply lg:hidden fixed top-0 left-0 w-full h-full bg-black/10 z-10;
}
</style>
