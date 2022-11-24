// import eslint from 'vite-plugin-eslint'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  nitro: {
    preset: 'cloudflare',
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
