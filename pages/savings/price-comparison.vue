<template>
    <div>
        <PageTitle title="Price Comparison" />

        <PrimeDataTable :row-class="getRowClass" :value="data">
            <PrimeColumn field="item" header="Name" />
            <PrimeColumn class="price" header="Our Price">
                <template #body="slotProps">
                    ${{ slotProps.data.price }}
                </template>
            </PrimeColumn>
            <PrimeColumn
                v-for="competitor in competitorNames"
                :key="competitor"
                :header="`${competitor} Price`"
            >
                <template #body="slotProps">
                    {{
                        getCompetitorPriceString(
                            slotProps.data.competitors,
                            competitor,
                        ) ?? 'No Data'
                    }}
                </template>
            </PrimeColumn>
        </PrimeDataTable>
    </div>
</template>

<script setup lang="ts">
type Competitor = {
    name: string
    price: number
}

const { find } = useStrapi()

const result = await useAsyncData('comparisons', () =>
    find('comparisons', {
        sort: 'publishedAt:desc',
        populate: '*',
    }),
)

const data = computed(() => {
    return result.data.value?.data || []
})

const competitorNames = computed(() => {
    const names = new Set()

    data.value.forEach((item) => {
        item.competitors?.forEach((competitor: Competitor) =>
            names.add(competitor.name),
        )
    })

    return Array.from(names)
})

function getCompetitorPriceString(
    competitors: Competitor[],
    competitorName: string,
) {
    const competitor = competitors.find(
        (competitor) => competitor.name === competitorName,
    )
    return competitor ? `$${competitor.price}` : null
}

function getRowClass(item: any) {
    const competitorPrices = item.competitors.map((c) => c.price)

    const minPrice = Math.min(...competitorPrices)
    const maxPrice = Math.max(...competitorPrices)

    if (item.price < minPrice) {
        return 'green'
    } else if (item.price > maxPrice) {
        return 'red'
    } else {
        return 'yellow'
    }
}
</script>

<style scoped>
:deep(.red .price) {
    background-color: red;
}

:deep(.yellow .price) {
    background-color: yellow;
}

:deep(.green .price) {
    background-color: green;
}
</style>
