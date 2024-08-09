<template>
    <div
        class="relative overflow-hidden flex flex-col justify-end mb-10"
        :class="{
            'h-[300px]': !!props.image,
            'h-auto': !props.image,
        }"
        :style="backgroundImageStyles"
    >
        <div class="absolute inset-0 bg-brand-blue-darker/95" />

        <div class="container relative text-white py-8">
            <slot>
                <AppTypography v-if="props.title" tag="h1">{{
                    props.title
                }}</AppTypography>

                <p v-if="props.subtitle">{{ props.subtitle }}</p>
            </slot>
        </div>
    </div>
</template>

<script setup>
const img = useImage()
const props = defineProps({
    title: {
        type: String,
        default: undefined,
    },
    subtitle: {
        type: String,
        default: undefined,
    },
    image: {
        type: String,
        default: undefined,
    },
})

const backgroundImageStyles = computed(() => {
    if (!props.image) return undefined

    const imageUrl = img(props.image, { width: 2000 })

    return {
        backgroundImage: `url('${imageUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    }
})
</script>

<style lang="scss" scoped></style>
