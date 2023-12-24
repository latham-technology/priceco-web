<template>
    <div>
        <PageTitle
            title="Frozen Products"
            :images="[
                '/img/grocery/frozen/frozLg01.png',
                '/img/grocery/frozen/frozSm01.png',
                '/img/grocery/frozen/frozSm02.png',
            ]"
        />

        <PageContent>
            <template #sidebar>
                <MoreInformation :links="links" />
            </template>

            <AppTypography>
                PriceCo Foods has two full aisles, four end caps and two huge
                sections in the meat department packed full of frozen food
                selections.
            </AppTypography>
            <AppTypography>
                We carry Crystal Ice cream as well as Ben & Jerry’s, Bryers,
                Dryers and many other specialty ice creams. We also carry many
                organic, meatless, vegan, low sodium, sugar free and gluten free
                brands.
            </AppTypography>
        </PageContent>
    </div>
</template>

<script setup lang="ts">
const links = [
    {
        text: 'Producers Dairy',
        href: 'http://www.producersdairy.com/',
        target: '_blank',
    },
    {
        text: 'Foster Farms',
        href: 'https://www.fosterfarms.com/',
        target: '_blank',
    },
    {
        text: 'So Delicious Dairy',
        href: 'https://sodeliciousdairyfree.com/',
        target: '_blank',
    },
]
</script>
