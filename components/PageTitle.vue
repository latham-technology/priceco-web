<template>
    <div class="page-title">
        <div v-if="images" class="page-title__images">
            <NuxtImg
                v-for="(image, index) in images"
                v-bind="getImageProps(image, index)"
                :key="index"
            />
        </div>

        <AppTypography class="text-red-500" tag="h1">
            {{ title }}
        </AppTypography>
    </div>
</template>

<script setup lang="ts">
defineProps<{ images?: string[] | object[]; title?: string }>()

function getImageDimensionsByIndex(index: number) {
    switch (index) {
        case 0:
            return {
                height: 163,
                width: 616,
            }

        case 1:
        case 2:
            return {
                height: 163,
                width: 148,
            }
        default:
            return {
                height: undefined,
                width: undefined,
            }
    }
}

function getImageProps(image, index) {
    const { height, width } = getImageDimensionsByIndex(index)

    const commonProps = {
        height,
        width,
        sizes: '100vw md:696px lg:616px',
    }

    switch (typeof image) {
        case 'object': {
            return {
                ...commonProps,
                ...image,
            }
        }

        case 'string': {
            return {
                ...commonProps,
                src: image,
            }
        }

        default: {
            return commonProps
        }
    }
}
</script>

<style lang="scss" scoped>
.page-title {
    &__images {
        @apply grid grid-cols-6;
        @apply gap-2 mb-4;
        @apply overflow-hidden;

        img {
            @apply w-full h-full object-cover;
            @apply border border-solid border-brand-blue;

            &:nth-child(1) {
                @apply col-span-6 lg:col-span-4;
            }

            &:nth-child(2),
            &:nth-child(3) {
                @apply hidden lg:block;
            }
        }
    }

    &__title {
    }
}
</style>
