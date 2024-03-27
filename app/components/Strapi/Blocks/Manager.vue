<template>
    <div>
        <component
            :is="resolveBlockComponent(__component)"
            v-for="{ __component, id, ...rest } in blocks"
            :key="getComponentKey(__component, id)"
            v-bind="rest"
        />
    </div>
</template>

<script setup>
import { resolveComponent } from 'vue'

defineProps({
    blocks: {
        type: Array,
        required: true,
    },
})

const resolveBlockComponent = (name) => {
    switch (name) {
        case 'blocks.title':
            return resolveComponent('StrapiBlocksTitle')
        case 'blocks.rich-text':
            return resolveComponent('StrapiBlocksRichTextMarkdown')
    }
}

const getComponentKey = (name, id) => `${name}-${id}`
</script>
