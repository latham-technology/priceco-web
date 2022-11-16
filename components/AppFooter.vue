<template>
  <footer class="footer">
    <div class="container">
      <ul class="footer__columns">
        <li v-for="(column, index) in columns" :key="index" class="column">
          <h5 class="column__title">
            {{ column.title.toUpperCase() }}
          </h5>
          <ul>
            <li v-for="({ text, ...link }, index) in column.links" :key="index">
              <NuxtLink v-bind="link" class="column__link">
                {{ text }}
              </NuxtLink>
            </li>
          </ul>
        </li>
      </ul>
      <div class="footer__attribution">
        <p>&copy; PriceCo Foods 2012-{{ new Date().getFullYear() }}. All rights reserved.</p>
        <p>Made with ❤️ by <a href="http://mattlatham.dev">Matt Latham</a></p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const columns = [
  {
    title: 'Store',
    links: [
      {
        text: 'Weekly Specials',
        to: '/ad'
      },
      {
        text: 'Directions',
        to: 'https://maps.google.com/maps?daddr=Price+Co+Foods,+13765+Mono+Way,+Sonora,+CA&hl=en&sll=37.986351,-120.383273&sspn=0.013952,0.027874&oq=Price&mra=ls&t=m&z=17'
      },
      {
        text: 'Services',
        to: '/services'
      }
    ]
  },
  {
    title: 'Products',
    links: [
      {
        text: 'Gluten Free',
        to: '/products/glutenfree/'
      },
      {
        text: 'Gourmet Wines',
        to: '/products/wine'
      },
      {
        text: 'New Item Request',
        to: '/products/order'
      }
    ]
  },
  {
    title: 'Company Info',
    links: [
      {
        text: 'Customer Service',
        to: '/about'
      },
      {
        text: 'Ad Match Guarantee',
        to: '/savings/admatch'
      }
    ]
  },
  {
    title: 'Community',
    links: [
      {
        text: 'Junction Shopping',
        href: 'http://junctionshoppingcenter.com/'
      },
      {
        text: 'Tuolumne County',
        href: 'http://www.co.tuolumne.ca.us/'
      },
      {
        text: 'Scrip Program',
        to: '/savings/scrip'
      }
    ]
  },
  {
    title: 'Careers',
    links: [
      {
        text: 'Apply',
        to: '/jobs'
      }
    ]
  },
  {
    title: 'Connect',
    links: [
      {
        text: 'Facebook',
        href: 'http://www.facebook.com/profile.php?id=100001882288907',
        image: '/img/gb.png'
      }
    ]
  }
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
    @apply mb-2;
  }

  &__link {
    @apply transition-colors text-[#355974] hover:text-[#70bbf4];
  }
}
</style>
