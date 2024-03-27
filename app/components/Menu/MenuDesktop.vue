<template>
    <div class="container mx-auto flex items-center gap-2 flex-wrap">
        <MenuDropdown
            v-for="(item, index) in navigationItems"
            :key="index"
            v-bind="item"
        />
    </div>
</template>

<script setup lang="ts">
// const navigationItems = useMenu()

const menu = await useStrapi().findOne(
    'navigation/render/main-navigation?type=TREE',
)

const renderNavigationItem = (item) => {
    return {
        text: item.title,
        to: item.type === 'WRAPPER' ? null : item.path,
        children: item.items.length
            ? item.items.map((child) => renderNavigationItem(child))
            : null,
    }
}

const navigationItems = menu.map(renderNavigationItem)
</script>
