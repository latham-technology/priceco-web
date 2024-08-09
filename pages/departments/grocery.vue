<template>
    <div>
        <FullWidthHeader
            image="/img/store-front.jpg"
            title="Grocery Department"
        />

        <div class="container">
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

            <AppTypography
                id="specialty"
                class="text-red-500"
                tag="h2"
            >
                Specialty Products
            </AppTypography>

            <AppTypography>
                PriceCo Foods is happy to supply one of the largest
                varieties of specialty items in every department. The
                grocery department has hard to find spices, sauces,
                soups, chips, baking products (<a
                    href="http://www.bobsredmill.com/"
                    target="_blank"
                    >Bob's Red Mill</a
                >
                is a favorite), organics, cereals, and juices to name
                a few.
            </AppTypography>

            <AppTypography
                id="gluten-free"
                class="text-red-500"
                tag="h2"
            >
                Gluten-Free Products
            </AppTypography>

            <AppTypography>
                We have expanded our gluten-free sections to four
                doors of frozen located on the back left side of aisle
                1. We carry
                <a
                    href="https://www.udisglutenfree.com/"
                    target="_blank"
                    >Udi’s brand</a
                >
                breads, tortillas and muffins as well as many
                desserts, chicken nuggets and hot dogs.
            </AppTypography>

            <AppTypography>
                In the dry section on aisle 10 we have 20 feet of all
                the gluten free items we can find. If you are getting
                different items at a health food store or elsewhere
                let us know and we will try to find it.
            </AppTypography>

            <AppTypography>
                <a
                    href="http://www.mayoclinic.com/health/gluten-free-diet/my01140"
                    target="_blank"
                    >Learn more about gluten-free diets</a
                >
            </AppTypography>

            <AppTypography id="wine" class="text-red-500" tag="h2">
                Gourmet Wine
            </AppTypography>

            <AppTypography>
                Here at PriceCo Foods, we carry many of your favorite
                wines, including several famous local wines, all at
                great prices! Choose from many of your favorites like
                Woodbridge, Sutter Home, Gallo Family Wines,
                Van-Ruiten, Barefoot and many many more!
            </AppTypography>

            <NuxtImg sizes="928px" src="/img/store-wine-1.jpg" />

            <AppTypography
                >From our local vineyards, choose from wines like
                <a
                    href="http://www.ironstonevineyards.com/"
                    target="_blank"
                    >Ironstone</a
                >, the area's premier winery. Also Hatcher, Mount
                Brow, Milliaire, Chatom, Rombauer,
                <a
                    href="http://www.stevenotwinery.com/"
                    target="_blank"
                    >Stevenot</a
                >,
                <a
                    href="http://www.irishvineyard.com/"
                    target="_blank"
                    >Irish</a
                >, and
                <a href="http://www.hoveywine.com/" target="_blank"
                    >Hovey</a
                >, just to name a few.
            </AppTypography>

            <AppTypography
                >We are constantly trying to add new wines to our
                selection, to give our customers something new and
                exciting to choose from.
            </AppTypography>

            <AppTypography id="frozen" class="text-red-500" tag="h2">
                Frozen Products
            </AppTypography>

            <AppTypography>
                PriceCo Foods has two full aisles, four end caps and
                two huge sections in the meat department packed full
                of frozen food selections. We carry Crystal Ice cream
                as well as Ben & Jerry’s, Bryers, Dryers and many
                other specialty ice creams. We also carry many
                organic, meatless, vegan, low sodium, sugar free and
                gluten free brands.
            </AppTypography>

            <AppTypography id="new-item" class="mt-10">
                <AppAccordion
                    :default-open="isNewItemFormOpen"
                    label="Request New Product"
                >
                    <ProductRequestForm />
                </AppAccordion>
            </AppTypography>
        </div>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()

const isNewItemFormOpen = computed(() => {
    return Object.keys(route.query).includes('new-item')
})
</script>
