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
const { data } = await useAsyncData('ad', async () => {
    const result = await useStrapi().find('ads', {
        populate: '*',
        sort: 'publishedAt:desc',
        pagination: {
            start: 0,
            limit: 1,
        },
    })

    if (!result.data.length) {
        throw createError({
            statusCode: 404,
            message: 'Not found, please try again later.',
        })
    }

    return result.data.pop()
})

const images = computed(() => {
    return data.value?.attributes.images.data.map((image) =>
        reactive({
            ...image.attributes,
            loading: true,
        }),
    )
})

useHead({
    title: `${data.value?.attributes.name} | PriceCo Foods`,
})
</script>

<style scoped lang="scss">
.pdf-viewer {
    @apply h-full w-full min-h-screen;
}
</style>
