import eslint from 'vite-plugin-eslint'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  vite: {
    plugins: [
      eslint()
    ]
  }
})
