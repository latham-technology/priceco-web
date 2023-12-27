import { StatusCodes } from 'http-status-codes'
import type {
    EmailSavingsFormData,
    JobsFormData,
    NewItemFormData,
    SurveyFormData,
} from '~/types'
import { ensureError } from '~/utils'

type JobsRequestBody = {
    type: 'jobs'
    payload: JobsFormData
}

type EmailSavingsRequestBody = {
    type: 'esp'
    payload: EmailSavingsFormData
}

type NewItemRequestBody = {
    type: 'newItem'
    payload: NewItemFormData
}

type SurveyRequestBody = {
    type: 'survey'
    payload: SurveyFormData
}

type RequestBody = (
    | JobsRequestBody
    | EmailSavingsRequestBody
    | NewItemRequestBody
    | SurveyRequestBody
) & {
    _turnstile: string
}

export default defineEventHandler(async (event) => {
    const { mg } = useNitroApp()
    const { type, payload, _turnstile } = await readBody<RequestBody>(event)

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
                    'h:X-Mailgun-Variables': JSON.stringify(payload),
                    'o:testmode': process.env.NODE_ENV === 'development',
                })
            }

            case 'survey': {
                return await mg.messages.create(mgDomain, {
                    'to': mgMailTo,
                    'subject': getSubject('Survey'),
                    'template': 'survey',
                    'h:X-Mailgun-Variables': JSON.stringify(payload),
                    'o:testmode': process.env.NODE_ENV === 'development',
                })
            }
        }
    } catch (err) {
        const error = ensureError(err)

        sendError(
            event,
            createError({
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                ...error,
            }),
        )
    }
})

function getSubject(form: string) {
    const { hostname } = new URL(process.env.NUXT_PUBLIC_BASE_URL)

    return `Submission from ${hostname}: ${form}`
}
