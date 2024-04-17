import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import type { IMailgunClient } from 'mailgun.js/Interfaces'
import type {
    MailgunMessageData,
    MessagesSendResult,
} from 'mailgun.js'

declare module 'nitropack' {
    interface NitroApp {
        $mailer: {
            client: IMailgunClient
            makeSubject: (string: string) => string
            sendMail: (
                payload: any,
                options: MailgunMessageData,
            ) => Promise<MessagesSendResult>
        }
    }
}

const mailgun = new Mailgun(FormData)

export default defineNitroPlugin((nitroApp) => {
    const config = useRuntimeConfig()

    const mg = mailgun.client({
        username: 'api',
        key: config.mailgun.apiKey,
    })

    const makeSubject = (form: string) => {
        const { hostname } = new URL(config.public.baseUrl)
        return `Submission from ${hostname}: ${form}`
    }

    nitroApp.$mailer = {
        client: mg,
        makeSubject,
        sendMail: (payload, options) => {
            return mg.messages.create(config.public.mailgun.domain, {
                'to': config.public.mailgun.mailTo,
                'h:X-Mailgun-Variables': JSON.stringify(payload),
                'o:testmode':
                    config.public.environment === 'development',
                ...options,
            })
        },
    }
})
