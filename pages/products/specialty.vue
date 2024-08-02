<template>
    <div>
        <PageTitle
            :images="[
                {
                    src: '/img/grocery/specialty/specLg01.png',
                    alt: '',
                },
                {
                    src: '/img/grocery/specialty/specSm01.png',
                    alt: '',
                },
                {
                    src: '/img/grocery/specialty/specSm02.png',
                    alt: '',
                },
            ]"
            title="Specialty Products"
        />

        <PageContent>
            <template #sidebar>
                <MoreInformation :links="links" />
            </template>

            <AppTypography>
                PriceCo Foods is happy to supply one of the largest
                varieties of specialty items in every department. The
                grocery department has hard to find spices, sauces,
                soups, chips, baking products (Bob’s Red Mill is a
                favorite), organics, cereals, and juices to name a
                few.
            </AppTypography>
            <AppTypography>
                In every department you will find unusual out of the
                ordinary products.
            </AppTypography>
        </PageContent>
    </div>
</template>

<script setup lang="ts">
const links = [
    {
        text: "Bob's Red Mill",
        href: 'http://www.bobsredmill.com/',
    },
]
</script>
