import type { AuthSession } from '~~/auth/server/utils/session'

export default defineNuxtPlugin(async (nuxtApp) => {
    // Skip plugin when rendering error page
    if (nuxtApp.payload.error) {
        return {}
    }

    const { data: session, refresh: updateSession } = await useFetch<{
        data: AuthSession
        status: string
    }>('/api/auth/session')

    const loggedIn: any = computed(() => !!session.value?.data.email)

    // Create a ref to know where to redirect the user when logged in
    const redirectTo = useState('authRedirect')

    /**
     * Add global route middleware to protect pages using:
     *
     * definePageMeta({
     *  auth: true
     * })
     */
    //

    addRouteMiddleware(
        'auth',
        (to) => {
            if (to.meta.auth && !loggedIn.value) {
                redirectTo.value = to.path
                return '/admin/login'
            }
        },
        { global: true },
    )

    const currentRoute = useRoute()

    if (process.client) {
        watch(loggedIn, async (loggedIn) => {
            if (!loggedIn && currentRoute.meta.auth) {
                redirectTo.value = currentRoute.path
                await navigateTo('/admin/login')
            }
        })
    }

    if (loggedIn.value && currentRoute.path === '/admin/login') {
        await navigateTo(redirectTo.value || '/admin')
    }

    return {
        provide: {
            auth: {
                loggedIn,
                session: session.value?.data,
                redirectTo,
                updateSession,
            },
        },
    }
})
