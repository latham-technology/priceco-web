<template>
  <div>
    <header class="p-4 bg-gradient-to-t from-[#4d80a5] to-white">
      <div class="container mx-auto flex items-center justify-between gap-2">
        <nuxt-link to="/">
          <span class="sr-only">PriceCo Foods Home</span>
          <img src="~/assets/img/priceco-logo.png" alt="PriceCo Foods">
        </nuxt-link>

        <div class="flex items-start gap-4">
          <div>
            <p class="underline">
              Monday - Saturday
            </p>
            <p>7:00am - 9:00pm</p>
            <p class="underline">
              Sunday
            </p>
            <p>8:00am - 9:00pm</p>
          </div>

          <div>
            <p>13765 Mono Way</p>
            <p>Sonora, California 95370</p>
            <p>Phone: (209) 532-4343</p>
            <p>
              <nuxt-link to="/about">
                Contact Us
              </nuxt-link>
            </p>
          </div>

          <div>
            <a href="http://maps.google.com/maps?q=Price+Co+Foods,+13765+Mono+Way,+Sonora,+CA+95370&hl=en&sll=37.0625,-95.677068&sspn=56.637293,114.169922&oq=1&hq=Price+Co+Foods,&hnear=13765+Mono+Way,+Sonora,+California+95370&t=m&z=17" target="_blank"><img src="~/assets/img/googmap.png" width="67" height="90" alt="Map"></a>
          </div>
        </div>
      </div>
    </header>

    <nav class="bg-gradient-to-t from-[#deefff] to-[#98bede] border-solid border-y border-brand-blue-darker">
      <div class="container mx-auto flex items-center gap-4">
        <MenuDropdown v-for="(item, index) in navigationItems" :key="index" v-bind="item" />
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
const navigationItems = [
  {
    text: 'Home',
    to: '/'
  },
  {
    text: 'Weekly Specials',
    to: '/ad'
  },
  {
    text: 'Departments',
    children: [
      {
        text: 'Grocery',
        to: '/departments/grocery'
      },
      {
        text: 'Produce',
        to: '/departments/produce'
      },
      {
        text: 'Meat',
        to: '/departments/meat'
      },
      {
        text: 'Seafood',
        to: '/departments/seafood'
      },
      {
        text: 'Bakery',
        to: '/departments/bakery'
      },
      {
        text: 'Deli',
        to: '/departments/deli'
      },
      {
        text: 'Floral',
        to: '/departments/floral'
      }
    ]
  },
  {
    text: 'Savings',
    children: [
      {
        text: 'Email Savings',
        to: '/savings/emailsavings'
      },
      {
        text: 'Double Coupons',
        to: '/savings/doublecoupons'
      },
      {
        text: 'Ad Match',
        to: '/savings/admatch'
      },
      {
        text: 'Scrip Program',
        to: '/savings/scrip'
      }
    ]
  }
]
</script>
