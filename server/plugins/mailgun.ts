import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import type { IMailgunClient } from 'mailgun.js/Interfaces'
import type {
    MailgunMessageData,
    MessagesSendResult,
} from 'mailgun.js'
import { useHealthcheck } from '~/utils'

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
        sendMail: async (payload, options) => {
            const _options = {
                'to': config.public.mailgun.mailTo,
                'h:X-Mailgun-Variables': JSON.stringify(payload),
                'o:testmode': config.public.mailgun.testMode,
                ...options,
            }

            try {
                const response = await mg.messages.create(
                    config.public.mailgun.domain,
                    _options,
                )

                if (response.id) {
                    useHealthcheck(
                        'https://hc-ping.com/7cbd885b-a466-48c5-8f8f-ac0d6d0a3da2',
                    )
                }

                return response
            } catch (error) {
                nitroApp.$sentry.captureException(error)
                return Promise.reject(error)
            }
        },
    }
})
