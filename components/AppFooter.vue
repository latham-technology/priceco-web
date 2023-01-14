<template>
  <footer class="footer">
    <div class="container">
      <ul class="footer__columns">
        <li v-for="(column, index) in columns" :key="index" class="column">
          <h5 class="column__title">
            {{ column.title }}
          </h5>
          <ul>
            <li v-for="({ text, ...link }, index) in column.links" :key="index">
              <NuxtLink v-bind="link" class="column__link">
                {{ text }}
              </NuxtLink>
            </li>
          </ul>
        </li>

        <li v-if="socialNetworks.length" class="column">
          <h5 class="column__title">Connect</h5>
          <ul class="flex items-center gap-1">
            <li v-for="network in socialNetworks" :key="network.name">
              <NuxtLink
                class="flex items-center gap-1"
                target="_blank"
                :to="network.url"
              >
                <div class="h-8 w-8" v-html="network.icon" />
                <span class="sr-only">{{ network.name }}</span>
              </NuxtLink>
            </li>
          </ul>
        </li>
      </ul>
      <div class="footer__attribution">
        <p>
          &copy; PriceCo Foods 2012-{{ new Date().getFullYear() }}. All rights
          reserved.
        </p>
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
const { googleMapsUrl, socialNetworks } = useCompanyDetails().value

const columns = [
  {
    title: 'Store',
    links: [
      {
        text: 'Weekly Specials',
        to: '/ad',
      },
      {
        text: 'Directions',
        to: googleMapsUrl,
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
        text: 'Ad Match Guarantee',
        to: '/savings/admatch',
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
    @apply flex items-start justify-start gap-16 flex-wrap;
  }

  &__attribution {
    @apply py-4 mt-8 flex gap-4 justify-between;
  }
}

.column {
  @apply flex flex-col;

  &__title {
    @apply mb-2 uppercase;
  }

  &__link {
    @apply transition-colors text-[#355974] hover:text-[#70bbf4];
  }
}
</style>
