import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      // plausible: {
      //   domain: process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN,
      //   apiHost: process.env.NUXT_PUBLIC_PLAUSIBLE_APIHOST,
      // },
      mailgun: {
        baseUrl: process.env.NUXT_PUBLIC_MAILGUN_API_BASE_URL,
        sender: 'no-reply@mg.pricecofoods.org',
        mailTo: 'lath.mj@gmail.com',
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

  modules: [
    // 'nuxt-bugsnag',
    '@nuxtjs/strapi',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/turnstile',
    '@nuxtjs/plausible',
    '@rah-emil/vite-plugin-vue-type-imports/nuxt',
  ],

  // bugsnag: {
  //   publishRelease: true,
  //   baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
  //   config: {
  //     apiKey: process.env.NUXT_PUBLIC_BUGSNAG_API_KEY,
  //     enabledReleaseStages: ['production'],
  //     releaseStage: process.env.NODE_ENV,
  //     appVersion: version,
  //   },
  // },

  plausible: {
    apiHost: 'https://plausible.niftyneat.net',
  },

  build: {
    transpile: ['@headlessui/vue'],
  },

  vite: {
    plugins: [
      // eslint()
    ],
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },

      charset: 'utf-8',
      title: 'PriceCo Foods',
      link: [
        {
          rel: 'stylesheet',
          type: 'text/css',
          href: 'https://fonts.googleapis.com/css?family=Droid+Serif:400,700|Droid+Sans:400,700&display=swap',
        },
      ],
      meta: [
        {
          name: 'description',
          content:
            'A family owned and operated grocery store serving Sonora, Jamestown and the surrounding area. Wide variety of gluten free and organic foods.',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          property: 'og:description',
          content:
            'A family owned and operated grocery store serving Sonora, Jamestown and the surrounding area. Wide variety of gluten free and organic foods.',
        },
        {
          property: 'og:image',
          content: '/logo.png',
        },
      ],
    },
  },

  strapi: {
    url: process.env.NUXT_PUBLIC_STRAPI_URL,
  },
})