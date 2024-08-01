export default defineNuxtConfig({
    runtimeConfig: {
        auth: {
            name: 'nuxt-session',
            password:
                process.env.NUXT_AUTH_PASSWORD ||
                'secretsecretsecretsecretsecretsecretsecret',
            maxAge: 60 * 60 * 24 * 7,
        },
    },
    nitro: {
        storage: {
            '.data:auth': { driver: 'fs', base: './.data/auth' },
        },
    },
})
