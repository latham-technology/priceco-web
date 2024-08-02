import dayjs from 'dayjs'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.$dayjs = dayjs
})
