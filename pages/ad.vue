<template>
    <div class="flex flex-col gap-10 min-h-screen">
        <div v-for="image in images" :key="image.name">
            <NuxtImg
                alt=""
                class="shadow-xl"
                :class="{
                    'w-full': true,
                    'blur-sm': image.loading,
                }"
                :placeholder="
                    useStrapiMedia(image.formats.thumbnail.url)
                "
                preload
                sizes="sm:350 md:768 lg:960"
                :src="useStrapiMedia(image.url)"
                @load="image.loading = false"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
const { find } = useStrapi()
const { $dayjs } = useNuxtApp()

const { data, status } = await useAsyncData('ad', () =>
    find('ads', {
        populate: ['pages.image'],
        sort: 'publishedAt:desc',
        filters: {
            $and: [
                {
                    startDate: {
                        $lte: $dayjs().format('YYYY-MM-DD'),
                    },
                },
                {
                    endDate: {
                        $gt: $dayjs().format('YYYY-MM-DD'),
                    },
                },
            ],
        },
    }),
)

if (status.value === 'error') {
    throw createError({
        statusCode: 500,
        message: 'There was a problem, please try again later.',
    })
}

if (status.value === 'success' && data.value?.data.length === 0) {
    throw createError({
        statusCode: 404,
        message: 'Not found, please try again later.',
    })
}

const ad = computed(() => {
    return data.value?.data[0]
})

const images = computed(() => {
    return ad.value?.pages.map((page) =>
        reactive({
            ...page.image,
            loading: true,
        }),
    )
})

const dateRangeString = computed(() => {
    const [startDate, endDate] = [
        ad.value?.startDate,
        ad.value?.endDate,
    ].map((date) => $dayjs(date).format('M/DD'))

    return `${startDate} - ${endDate}`
})

useHead({
    title: () => {
        return `Specials valid from ${dateRangeString.value} | PriceCo Foods`
    },
})
</script>

<style scoped lang="scss">
.pdf-viewer {
    @apply h-full w-full min-h-screen;
}
</style>
