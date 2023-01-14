// import eslint from 'vite-plugin-eslint'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      plausible: {
        domain: process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN,
        apiHost: process.env.NUXT_PUBLIC_PLAUSIBLE_APIHOST,
      },
      mailgun: {
        baseUrl: process.env.NUXT_PUBLIC_MAILGUN_API_BASE_URL,
        sender: 'no-reply@mg.pricecofoods.org',
      },
    },

    turnstile: {
      secretKey: process.env.NUXT_TURNSTILE_SECRET_KEY,
    },

    mailgun: {
      apiKey: process.env.NUXT_MAILGUN_API_KEY,
    },
  },

  turnstile: {
    siteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
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

  app: {
    head: {
      charset: 'utf-8',
      title: 'PriceCo Foods',
      meta: [
        {
          name: 'description',
          content:
            'A family owned and operated grocery store serving Sonora, Jamestown and the surrounding area. Wide variety of gluten free and organic foods.',
        },
      ],
    },
  },
})
