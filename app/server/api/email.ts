import { StatusCodes } from 'http-status-codes'
import type { RequestBody } from '@/types'

type EmailRequestBody = RequestBody & {
    _turnstile: string
}

export default defineEventHandler(async (event) => {
    const { type, payload, _turnstile } = await readBody<EmailRequestBody>(
        event,
    )

    if (!(await verifyTurnstileToken(_turnstile))) {
        return sendError(
            event,
            createError({
                statusCode: StatusCodes.BAD_REQUEST,
                message: useConstants().API_TURNSTILE_VERIFICATION_FAILED,
            }),
        )
    }

    try {
        const { mg } = useNitroApp()
        const {
            NUXT_MAILGUN_DOMAIN: mgDomain,
            NUXT_MAILGUN_MAIL_TO: mgMailTo,
        } = process.env

        switch (type) {
            case 'esp': {
                return await mg.messages.create(mgDomain, {
                    'to': mgMailTo,
                    'subject': getSubject('Email Savings Application'),
                    'template': 'email-savings',
                    'h:X-Mailgun-Variables': JSON.stringify(payload),
                    'o:testmode': process.env.NODE_ENV === 'development',
                })
            }

            case 'jobs': {
                return await mg.messages.create(mgDomain, {
                    'to': mgMailTo,
                    'subject': getSubject('Employment Application'),
                    'template': 'employment application',
                    'h:X-Mailgun-Variables': JSON.stringify(payload),
                    'o:testmode': process.env.NODE_ENV === 'development',
                })
            }

            case 'newItem': {
                return await mg.messages.create(mgDomain, {
                    'to': mgMailTo,
                    'subject': getSubject('New Item Request'),
                    'template': 'new-item',
                    'h:X-My-Mailgun-Variables': JSON.stringify(payload),
                    'o:testmode': process.env.NODE_ENV === 'development',
                })
            }

            case 'survey': {
                return await mg.messages.create(mgDomain, {
                    'to': mgMailTo,
                    'subject': getSubject('Survey'),
                    'template': 'survey',
                    'h:X-My-Mailgun-Variables': JSON.stringify(payload),
                    'o:testmode': process.env.NODE_ENV === 'development',
                })
            }
        }
    } catch (error) {
        console.log(error)
        return sendError(
            event,
            createError({
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: error?.message,
            }),
        )
    }
})

function getSubject(form: string) {
    const { hostname } = new URL(process.env.NUXT_PUBLIC_BASE_URL)

    return `Submission from ${hostname}: ${form}`
}
