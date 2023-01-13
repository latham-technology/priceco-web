<template>
  <div>
    <header class="py-4 bg-gradient-to-t from-[#4d80a5] to-white">
      <div
        class="container mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <nuxt-link to="/">
          <span class="sr-only">PriceCo Foods Home</span>
          <img alt="PriceCo Foods" src="~/assets/img/priceco-logo.png" />
        </nuxt-link>

        <div class="flex items-start gap-4">
          <div>
            <p class="underline">Monday - Saturday</p>
            <p>7:00am - 9:00pm</p>
            <p class="underline">Sunday</p>
            <p>8:00am - 9:00pm</p>
          </div>

          <div>
            <a class="text-link" href="https://goo.gl/maps/yznsfXefHP6ayLDX9">
              <p>13765 Mono Way</p>
              <p>Sonora, California 95370</p>
            </a>
            <p>
              Phone:
              <a class="text-link" href="tel:2095324343">(209) 532-4343</a>
            </p>
            <p>
              <nuxt-link class="text-link" to="/about"> Contact Us </nuxt-link>
            </p>
          </div>
        </div>
      </div>
    </header>

    <nav
      class="bg-gradient-to-t from-[#deefff] to-[#98bede] border-solid border-y border-brand-blue-darker"
    >
      <MenuDesktop class="hidden md:flex" :navigation-items="navigationItems" />
      <MenuMobile class="flex md:hidden" :navigation-items="navigationItems" />
    </nav>
  </div>
</template>

<script setup lang="ts">
const navigationItems = [
  {
    text: 'Home',
    to: '/',
  },
  {
    text: 'Weekly Specials',
    to: '/ad',
  },
  {
    text: 'Departments',
    children: [
      {
        text: 'Grocery',
        to: '/departments/grocery',
      },
      {
        text: 'Produce',
        to: '/departments/produce',
      },
      {
        text: 'Meat',
        to: '/departments/meat',
      },
      {
        text: 'Seafood',
        to: '/departments/seafood',
      },
      {
        text: 'Bakery',
        to: '/departments/bakery',
      },
      {
        text: 'Deli',
        to: '/departments/deli',
      },
      {
        text: 'Floral',
        to: '/departments/floral',
      },
    ],
  },
  {
    text: 'Savings',
    children: [
      {
        text: 'Email Savings',
        to: '/savings/emailsavings',
      },
      {
        text: 'Ad Match',
        to: '/savings/admatch',
      },
      {
        text: 'Scrip Program',
        to: '/savings/scrip',
      },
    ],
  },
  {
    text: 'About Us',
    to: '/about',
  },
]
</script>
