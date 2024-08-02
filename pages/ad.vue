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
                :src="image.url"
                @load="image.loading = false"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
const ad = ref()

const { data } = await useStrapi().find('ads', {
    populate: '*',
    sort: 'publishedAt:desc',
    pagination: {
        start: 0,
        limit: 1,
    },
})

if (!data.length) {
    showError({
        statusCode: 404,
        message: 'Ad not found. Please try again later.',
    })
}

ad.value = data.pop()

useHead({
    title: `${ad.value.attributes.name} | PriceCo Foods`,
})

const images = computed(() =>
    ad.value.attributes.images.data.map((image) => {
        return reactive({
            ...image.attributes,
            loading: true,
            url: useStrapiMedia(image.attributes.url),
        })
    }),
)
</script>

<style scoped lang="scss">
.pdf-viewer {
    @apply h-full w-full min-h-screen;
}
</style>
