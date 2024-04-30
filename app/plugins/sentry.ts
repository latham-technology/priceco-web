import * as Sentry from '@sentry/vue'

declare module '#app' {
    interface NuxtApp {
        $sentry: typeof Sentry
    }
}

async function lazyLoadSentryIntegration() {
    if (!process.client) return

    const { Replay } = await import('@sentry/vue')

    Sentry.addIntegration(
        new Replay({
            maskAllText: false,
            blockAllMedia: false,
        }),
    )
}

function getSentryIntegrations() {
    if (!process.client) return []

    const router = useRouter()
    const browserTracing = Sentry.browserTracingIntegration({
        router,
    })

    return [browserTracing]
}

export default defineNuxtPlugin({
    name: 'sentry',
    parallel: true,
    setup(nuxtApp) {
        const { vueApp } = nuxtApp
        const config = useRuntimeConfig()

        Sentry.init({
            app: vueApp,
            dsn: config.public.sentry.dsn ?? null,
            integrations: getSentryIntegrations(),
            tracesSampleRate: config.public.sentry.tracesSampleRate,
            // replaysSessionSampleRate:
            //     config.public.sentry.replaySampleRate,
            // replaysOnErrorSampleRate:
            //     config.public.sentry.errorSampleRate,
            environment: process.env.NODE_ENV,
            enabled: process.env.NODE_ENV === 'production',
        })

        lazyLoadSentryIntegration()

        nuxtApp.$sentry = Sentry
    },
})
