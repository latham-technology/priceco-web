<template>
    <div class="flex flex-col gap-20">
        <div v-for="url in images" :key="url">
            <img alt="" :src="url" />
        </div>
    </div>
</template>

<script setup lang="ts">
const ad = ref(null)
const images = ref([])

try {
    const { data } = await useStrapi().find('ads', {
        populate: '*',
        sort: 'publishedAt:desc',
        pagination: {
            start: 0,
            limit: 1,
        },
    })

    if (data.length) {
        ad.value = data.pop()?.attributes
        images.value = ad.value.images.data.map((image) =>
            useStrapiMedia(image.attributes.url),
        )

        useHead({
            title: `${ad.value.attributes.name} | PriceCo Foods`,
        })
    }
} catch (error) {}
</script>

<style scoped lang="scss">
.pdf-viewer {
    @apply h-full w-full min-h-screen;
}
</style>
