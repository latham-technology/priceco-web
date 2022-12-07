// import eslint from 'vite-plugin-eslint'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      plausible: {
        domain: process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN,
        apiHost: process.env.NUXT_PUBLIC_PLAUSIBLE_APIHOST,
      },
    },

    turnstile: {
      secretKey: process.env.NUXT_TURNSTILE_SECRET_KEY || '',
    },
  },

  turnstile: {
    siteKey: '0x4AAAAAAABgrk50JB4NYP8w',
  },

  modules: ['@nuxtjs/tailwindcss', 'nuxt-turnstile', '@nuxtjs/plausible'],

  nitro: {
    preset: 'cloudflare',
  },

  build: {
    transpile: ['@headlessui/vue'],
  },

  vite: {
    plugins: [
      // eslint()
    ],
    server: {
      watch: {
        usePolling: true,
      },
    },
  },
})
