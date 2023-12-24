<template>
    <div>
        <header class="py-4 bg-gradient-to-b from-white to-brand-blue-lighter">
            <div
                class="container mx-auto flex flex-col md:flex-row items-center gap-4"
            >
                <div class="flex-1">
                    <nuxt-link class="h-14 w-auto inline-flex" to="/">
                        <span class="sr-only">PriceCo Foods Home</span>
                        <img
                            alt="PriceCo Foods"
                            class="object-contain"
                            src="~/assets/img/logo.png"
                        />
                    </nuxt-link>
                </div>

                <div class="flex flex-col gap-4 mx-auto whitespace-nowrap">
                    <div class="grid grid-cols-2 gap-x-4">
                        <template v-for="item in hours" :key="item.key">
                            <p class="text-right">{{ item.key }}:</p>
                            <p>{{ item.value }}</p>
                        </template>
                    </div>

                    <div class="grid grid-cols-2 gap-x-4">
                        <a
                            class="text-link"
                            :href="`tel:${phone.replace(/[^0-9]/g, '')}`"
                            >{{ phone }}</a
                        >

                        <a
                            class="text-link"
                            :href="googleMapsUrl"
                            target="_blank"
                        >
                            <p>{{ address.street }}</p>
                            <p>
                                {{ address.city }},
                                {{ address.state }}
                                {{ address.zip }}
                            </p>
                        </a>
                    </div>
                </div>
            </div>
        </header>

        <nav
            class="bg-gradient-to-t from-[#deefff] to-[#98bede] border-solid border-y border-brand-blue-darker"
        >
            <MenuDesktop class="hidden md:flex" />
        </nav>
    </div>
</template>

<script setup lang="ts">
const { address, phone, hours, googleMapsUrl } = useCompanyDetails().value
</script>
