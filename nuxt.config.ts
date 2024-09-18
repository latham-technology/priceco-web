import { defineNuxtConfig } from 'nuxt/config'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import Aura from '@primevue/themes/aura'

export default defineNuxtConfig({
    extends: ['./auth'],

    runtimeConfig: {
        strapi: {
            url: process.env.STRAPI_URL,
        },

        public: {
            environment: process.env.NODE_ENV,
            baseUrl:
                process.env.NUXT_PUBLIC_BASE_URL ||
                process.env.BASE_URL,

            sentry: {
                dsn: process.env.SENTRY_DSN,
                tracesSampleRate: parseFloat(
                    process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0',
                ),
                replaySampleRate: parseFloat(
                    process.env.SENTRY_REPLAY_SAMPLE_RATE ?? '0',
                ),
                errorSampleRate: parseFloat(
                    process.env.SENTRY_ERROR_SAMPLE_RATE ?? '0',
                ),
            },

            mailgun: {
                domain: process.env.NUXT_PUBLIC_MAILGUN_DOMAIN,
                mailTo: process.env.NUXT_PUBLIC_MAILGUN_MAIL_TO,
                sender: process.env.NUXT_PUBLIC_MAILGUN_SENDER,
                testMode: Boolean(
                    process.env.NUXT_PUBLIC_MAILGUN_TEST_MODE,
                ),
            },

            bugsnag: {
                apiKey: process.env.NUXT_PUBLIC_BUGSNAG_API_KEY,
            },

            plausible: {
                apiHost: process.env.NUXT_PUBLIC_PLAUSIBLE_API_HOST,
                domain: process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN,
            },

            strapi: {
                url: process.env.STRAPI_URL,
            },

            turnstile: {
                enabled: Boolean(
                    process.env.NUXT_PUBLIC_TURNSTILE_ENABLED || true,
                ),
                siteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
            },
        },

        turnstile: {
            secretKey: process.env.NUXT_TURNSTILE_SECRET_KEY,
        },

        mailgun: {
            apiKey: process.env.NUXT_MAILGUN_API_KEY,
        },
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

    site: {
        url: process.env.NUXT_PUBLIC_BASE_URL,
    },

    modules: ['@nuxtjs/strapi', '@nuxtjs/tailwindcss', '@nuxtjs/turnstile', '@nuxtjs/plausible', '@nuxt/image', // 'nuxt-csurf',
    '@rah-emil/vite-plugin-vue-type-imports/nuxt', '@nuxtjs/sitemap', '@primevue/nuxt-module', 'dayjs-nuxt'],

    primevue: {
        autoImport: true,
        components: {
            prefix: 'Prime',
        },
        options: {
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: '.dark-mode',
                },
            },
        },
    },

    // csurf: {
    //     methodsToProtect: ['POST', 'PUT', 'PATCH'],
    // },

    plausible: {
        apiHost: process.env.NUXT_PUBLIC_PLAUSIBLE_API_HOST,
    },

    strapi: {
        url: process.env.STRAPI_URL,
    },

    turnstile: {
        siteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
        addValidateEndpoint: true,
    },

    image: {
        domains: ['api.pricecofoods.org'],
    },

    build: {
        transpile: ['@headlessui/vue'],
    },

    sourcemap: true,

    vite: {
        plugins: [
            sentryVitePlugin({
                disable: process.env.NODE_ENV === 'development',
                authToken: process.env.SENTRY_AUTH_TOKEN,
                org: process.env.SENTRY_ORG,
                project: process.env.SENTRY_PROJECT,
                telemetry: false,
                release: {
                    name: process.env.SENTRY_RELEASE_NAME,
                },
            }),
        ],
    },

    devtools: {
        enabled: Boolean(
            process.env.DEVTOOLS_ENABLED ||
                process.env.NODE_ENV === 'development',
        ),
    },

    compatibilityDate: '2024-07-17',
})