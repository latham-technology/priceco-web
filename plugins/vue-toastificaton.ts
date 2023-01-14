import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import type { PluginOptions } from 'vue-toastification'

export default defineNuxtPlugin((nuxtApp) => {
  const options: PluginOptions = {
    transition: 'Vue-Toastification__fade',
    maxToasts: 5,
    hideProgressBar: true,
  }

  nuxtApp.vueApp.use(Toast, options)
})
