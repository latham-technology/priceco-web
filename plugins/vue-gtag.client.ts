import { defineNuxtPlugin } from '#app'
import VueGtag from 'vue-gtag-next'

export default defineNuxtPlugin((nuxtApp) => {
  const getGDPR = localStorage.getItem('GDPR:accepted') || 'true'

  nuxtApp.vueApp.use(
    VueGtag,
    {
      property: {
        id: 'G-CC9KLYL10D',
      },
      appName: 'PriceCoFoods v2',
      enabled: getGDPR === 'true',
      pageTrackerScreenviewEnabled: true,
    },
    nuxtApp.$router
  )
})
