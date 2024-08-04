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
const ad = ref()

const { data } = await useAsyncData('ad', () => {
    return useStrapi()
        .find('ads', {
            populate: '*',
            sort: 'publishedAt:desc',
            pagination: {
                start: 0,
                limit: 1,
            },
        })
        .then((response) => response.data)
})

if (!data.value?.length) {
    throw createError({
        statusCode: 404,
        message: 'Not found, please try again later.',
    })
}

ad.value = data.value[0]

const images = computed(() => {
    return ad.value.attributes.images.data.map((image) =>
        reactive({
            ...image.attributes,
            loading: true,
        }),
    )
})

useHead({
    title: `${ad.value.attributes.name} | PriceCo Foods`,
})
</script>

<style scoped lang="scss">
.pdf-viewer {
    @apply h-full w-full min-h-screen;
}
</style>
