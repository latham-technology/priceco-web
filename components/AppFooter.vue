<template>
    <footer class="footer">
        <div class="container">
            <ul class="footer__columns">
                <li
                    v-for="(column, index) in columns"
                    :key="index"
                    class="column"
                >
                    <h1 class="column__title">
                        {{ column.title }}
                    </h1>
                    <ul>
                        <li
                            v-for="link in column.links"
                            :key="link.text"
                        >
                            <component
                                :is="componentForItem(link)"
                                v-bind="link"
                                class="column__link"
                            >
                                {{ link.text }}
                            </component>
                        </li>
                    </ul>
                </li>

                <li v-if="socialNetworks.length" class="column">
                    <h1 class="column__title">Connect</h1>
                    <ul class="flex items-center gap-1">
                        <li
                            v-for="network in socialNetworks"
                            :key="network.name"
                        >
                            <NuxtLink
                                v-tippy="network.name"
                                class="flex items-center gap-1"
                                target="_blank"
                                :to="network.url"
                            >
                                <div
                                    class="h-8 w-8"
                                    :style="{ color: network.color }"
                                    v-html="network.icon"
                                />
                                <span class="sr-only">{{
                                    network.name
                                }}</span>
                            </NuxtLink>
                        </li>
                    </ul>
                </li>
            </ul>
            <div class="footer__attribution">
                <div class="footer__accreditation">
                    <p>
                        &copy; PriceCo Foods 2012-{{
                            new Date().getFullYear()
                        }}. All rights reserved.
                    </p>
                    <a
                        href="https://www.w3.org/WAI/WCAG2AA-Conformance"
                        title="Explanation of WCAG 2 Level AA conformance"
                    >
                        <img
                            alt="Level AA conformance, W3C WAI Web Content Accessibility Guidelines 2.2"
                            height="32"
                            src="https://www.w3.org/WAI/WCAG22/wcag2.2AA-blue.svg"
                            width="88"
                        />
                    </a>
                </div>

                <p>
                    <a href="https://mattlatham.dev" target="_blank"
                        >Made with ❤️ by Matt Latham</a
                    >
                </p>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { directive as vTippy } from 'vue-tippy'
import type { MenuNavigationItem } from '@/types'

const { googleMapsUrl, socialNetworks } = useCompany()
const componentForItem = (item: MenuNavigationItem) => {
    if (item.href) return 'a'
    if (item.to) return resolveComponent('NuxtLink')
    return 'button'
}

const columns = [
    {
        title: 'Store',
        links: [
            {
                text: 'Weekly Specials',
                href: '/ad',
                target: '_blank',
            },
            {
                text: 'Directions',
                href: googleMapsUrl,
                target: '_blank',
            },
        ],
    },
    {
        title: 'Products',
        links: [
            {
                text: 'Gluten Free',
                to: '/products/glutenfree/',
            },
            {
                text: 'Gourmet Wines',
                to: '/products/wine',
            },
            {
                text: 'New Item Request',
                to: '/products/order',
            },
        ],
    },
    {
        title: 'Company Info',
        links: [
            {
                text: 'Customer Service',
                to: '/about',
            },
            {
                text: 'Privacy Policy',
                to: '/privacy-policy',
            },
        ],
    },
    {
        title: 'Community',
        links: [
            {
                text: 'Junction Shopping',
                href: 'http://junctionshoppingcenter.com/',
                target: '_blank',
            },
            {
                text: 'Tuolumne County',
                href: 'http://www.co.tuolumne.ca.us/',
                target: '_blank',
            },
            {
                text: 'Scrip Program',
                to: '/savings/scrip',
            },
        ],
    },
    {
        title: 'Careers',
        links: [
            {
                text: 'Apply',
                to: '/jobs',
            },
        ],
    },
]
</script>

<style lang="scss" scoped>
.footer {
    @apply border-t border-dotted border-[#355974];
    @apply bg-[#ebebeb] py-4;
    @apply text-sm;

    &__columns {
        @apply -mx-2 grid gap-2 gap-y-4 grid-cols-[repeat(auto-fill,minmax(150px,1fr))];
    }

    &__attribution {
        @apply py-4 mt-8 flex flex-col md:flex-row gap-4 justify-between;
    }

    &__accreditation {
        @apply flex flex-wrap items-center gap-2;
    }
}

.column {
    @apply flex flex-col;

    &__title {
        @apply mb-2 uppercase px-2 text-lg;
    }

    &__link {
        @apply inline-flex min-h-[44px] items-center px-2;
        @apply transition-colors text-[#355974] hover:text-[#70bbf4];
    }
}
</style>
