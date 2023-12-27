import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import type { IMailgunClient } from 'mailgun.js/Interfaces'

declare module 'nitropack' {
    interface NitroApp {
        mg: IMailgunClient
    }
}

const mailgun = new Mailgun(FormData)

export default defineNitroPlugin((nitroApp) => {
    const config = useRuntimeConfig()

    const mg = mailgun.client({
        username: 'api',
        key: config.mailgun.apiKey,
    })

    nitroApp.mg = mg
})
