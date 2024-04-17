import * as Sentry from '@sentry/node'
import { H3Error } from 'h3'

declare module 'nitropack' {
    interface NitroApp {
        $sentry: typeof Sentry
    }
}

export default defineNitroPlugin((nitroApp) => {
    const {
        public: { sentry },
    } = useRuntimeConfig()

    // If no sentry DSN set, ignore and warn in the console
    if (!sentry.dsn) {
        console.warn('Sentry DSN not set, skipping Sentry initialization')
        return
    }

    // Initialize Sentry
    Sentry.init({
        dsn: sentry.dsn,
        environment: process.env.NODE_ENV,
        integrations: [],
        // Performance Monitoring
        tracesSampleRate: 1.0, // Change in production!
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: 1.0, // Change in production!
    })

    // Inside the plugin, after initializing sentry
    nitroApp.hooks.hook('error', (error) => {
        if (error instanceof H3Error) {
            if (error.statusCode === 404 || error.statusCode === 422) {
                return
            }
        }

        Sentry.captureException(error)
    })

    nitroApp.$sentry = Sentry
})
