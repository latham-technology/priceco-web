import { ref } from 'vue'

export type HealthCheckOptions = {
    onError: (error: Error) => void
}

export const useHealthcheck = (
    url: string,
    minutes?: number | undefined,
    options?: HealthCheckOptions,
) => {
    if (!url) {
        throw new Error('Must provide healthcheck URL')
    }

    if (!options?.onError) {
        options = {
            ...(options || {}),
            onError: (error) => {
                throw error
            },
        }
    }

    const heartbeat = ref()
    const timer = ref()

    const check = (url: string) => {
        try {
            fetch(url)
        } catch (error) {
            options.onError(ensureError(error))
        }
    }

    const stop = () => {
        if (timer.value) {
            clearInterval(timer.value)
            timer.value = null
        }
    }

    const start = () => {
        stop()
        heartbeat.value()

        if (minutes) {
            timer.value = setInterval(
                heartbeat.value,
                minutes * 60 * 1000,
            )
        }
    }

    heartbeat.value = check(url)

    return {
        start,
        stop,
    }
}
