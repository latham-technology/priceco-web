<template>
    <div class="flex flex-col gap-10 min-h-screen">
        <div v-for="image in images" :key="image.name">
            <NuxtImg
                alt=""
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
const { $sentry } = useNuxtApp()

const { data, status, error } = await useAsyncData('ad', () =>
    useStrapi().find('ads', {
        populate: '*',
        sort: 'publishedAt:desc',
        pagination: {
            start: 0,
            limit: 1,
        },
    }),
)

if (status.value === 'error') {
    console.log(error.value)
    $sentry.captureException(error.value)

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
    return ad.value?.attributes.images.data.map((image) =>
        reactive({
            ...image.attributes,
            loading: true,
        }),
    )
})

useHead({
    title: () => `${ad.value?.attributes.name} | PriceCo Foods`,
})
</script>

<style scoped lang="scss">
.pdf-viewer {
    @apply h-full w-full min-h-screen;
}
</style>
