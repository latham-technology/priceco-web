import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import type { IMailgunClient } from 'mailgun.js/Interfaces'

declare module 'nitropack' {
    interface NitroApp {
        mg: IMailgunClient
    }
}

export default defineNitroPlugin((nitroApp) => {
    const mailgun = new Mailgun(FormData)

    console.log(process.env)
    console.log(useRuntimeConfig())

    const mg = mailgun.client({
        username: 'api',
        key: process.env.NUXT_MAILGUN_API_KEY,
    })

    nitroApp.mg = mg
})
