export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.config.errorHandler = (error) => {
        console.log(nuxtApp)
        nuxtApp.$bugsnag.notify(error)
    }
})
