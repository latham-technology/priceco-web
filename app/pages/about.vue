<template>
    <div>
        <PageTitle
            :images="[
                '/img/etc/services/servLg01.png',
                '/img/etc/services/contactSm01.jpg',
                '/img/etc/services/contactSm02.jpg',
            ]"
            title="Contact Us"
        />

        <AppTypography>
            The PriceCo Foods management and staff strive to provide customers
            with a wonderful store in which to shop, featuring a uniqueness and
            competitive pricing not normally found in your local supermarket.
            Our goal is to give you, the customer, a wonderful shopping
            experience each and every time they shop, and to provide them with
            those unique and/or signature items found only in our store! Please
            contact us to let us know how we're doing. We exist to serve you. We
            want to know how we can improve your shopping experience.
        </AppTypography>

        <div class="flex flex-col md:flex-row justify-between gap-8">
            <div class="flex flex-col gap-1">
                <h2 class="font-serif font-bold border-b border-solid text-lg">
                    Address
                </h2>
                <a class="text-link" :href="googleMapsUrl" target="_blank">
                    <p>{{ address.street }}</p>
                    <p>
                        {{ address.city }}, {{ address.state }}
                        {{ address.zip }}
                    </p>
                </a>
            </div>

            <div class="flex flex-col gap-1">
                <h2 class="font-serif font-bold border-b border-solid text-lg">
                    Hours of Operation
                </h2>
                <template v-for="item in hours" :key="item.key">
                    <p class="font-bold">{{ item.key }}</p>
                    <p>{{ item.value }}</p>
                </template>
            </div>

            <div class="flex flex-col gap-1">
                <h2 class="font-serif font-bold border-b border-solid text-lg">
                    Phone
                </h2>
                <a
                    class="text-link"
                    :href="`tel:${phone.replace(/[^0-9]/g, '')}`"
                    >{{ phone }}</a
                >
            </div>
        </div>

        <ContactForm />
    </div>
</template>

<script setup lang="ts">
const { address, phone, hours, googleMapsUrl } = useCompanyDetails().value
</script>
