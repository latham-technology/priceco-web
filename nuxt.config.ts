import { defineNuxtConfig } from 'nuxt/config'

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

  modules: [
    '@nuxtjs/tailwindcss',
    [
      '@storyblok/nuxt',
      {
        accessToken: process.env.NUXT_PUBLIC_STORYBLOK_TOKEN,
        apiOptions: {
          region: 'us',
        },
      },
    ],
    '@nuxtjs/turnstile',
    '@nuxtjs/plausible',
    '@rah-emil/vite-plugin-vue-type-imports/nuxt',
  ],

  plausible: {
    apiHost: 'https://plausible.niftyneat.net',
  },

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
  },

  devServer: {
    https: {
      key: './localhost-key.pem',
      cert: './localhost.pem',
    },
  },

  app: {
    head: {
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

  hooks: {
    async 'nitro:config'(nitroConfig) {
      if (!nitroConfig || nitroConfig.dev) {
        return
      }

      const token = process.env.NUXT_PUBLIC_STORYBLOK_TOKEN

      const routes = [
        '/', // For home directly but with / instead of /home
      ]

      try {
        const result = await fetch(
          `https://api.storyblok.com/v2/cdn/spaces/me?token=${token}`
        )

        if (!result.ok) {
          throw new Error('Could not fetch Storyblok data')
        }

        const { space } = await result.json()
        const cacheVersion = space.version || 0

        await fetchStories(routes, cacheVersion)

        nitroConfig.prerender?.routes?.push(...routes)
      } catch (error) {
        console.error(error)
      }
    },
  },
})

async function fetchStories(routes: string[], cacheVersion: number, page = 1) {
  const token = process.env.NUXT_PUBLIC_STORYBLOK_TOKEN
  const version = 'published'
  const perPage = 100
  const toIgnore = ['home', 'en/settings']

  try {
    const response = await fetch(
      `https://api.storyblok.com/v2/cdn/links?token=${token}&version=${version}&per_page=${perPage}&page=${page}&cv=${cacheVersion}`
    )
    const data = await response.json()

    Object.values(data.links).forEach((link) => {
      if (!toIgnore.includes(link.slug)) {
        routes.push('/' + link.slug)
      }
    })

    const total = response.headers.get('total')
    const maxPage = Math.ceil(total / perPage)

    if (maxPage > page) {
      await fetchStories(routes, cacheVersion, ++page)
    }
  } catch (error) {
    console.error(error)
  }
}
