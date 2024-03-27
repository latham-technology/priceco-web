<template>
    <div>
        <PageContent>
            <StrapiBlocksManager :blocks="page.attributes.blocks" />
        </PageContent>
    </div>
</template>

<script setup>
const route = useRoute()
const page = ref(null)

try {
    const { data } = await useStrapi().find('pages', {
        filters: {
            slug: route.params.slug,
        },
        populate: {
            seo: {
                populate: ['meta'],
            },
            blocks: true,
        },
    })

    page.value = data[0]
} catch (error) {}

const getMetaTags = (tags = []) => {
    return tags.reduce((tags, tag) => {
        return {
            ...tags,
            [tag.name]: tag.content,
        }
    }, {})
}

useSeoMeta({
    title: page.value.attributes.seo.title,
    description: page.value.attributes.seo.description,
    ...getMetaTags(page.value.attributes.seo.meta),
})
</script>
