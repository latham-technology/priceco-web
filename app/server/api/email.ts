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
    const config = useRuntimeConfig()
    const { $mg } = useNitroApp()
    const { type, payload, _turnstile } = await readBody<RequestBody>(event)

    // if (!(await verifyTurnstileToken(_turnstile))) {
    //     return sendError(
    //         event,
    //         createError({
    //             statusCode: StatusCodes.BAD_REQUEST,
    //             message: useConstants().API_TURNSTILE_VERIFICATION_FAILED,
    //         }),
    //     )
    // }

    try {
        const makeSubject = (form: string) => {
            const { hostname } = new URL(config.public.baseUrl)
            return `Submission from ${hostname}: ${form}`
        }

        switch (type) {
            case 'esp': {
                return await $mg.messages.create(config.public.mailgun.domain, {
                    'to': config.public.mailgun.mailTo,
                    'subject': makeSubject('Email Savings Application'),
                    'template': 'email-savings',
                    'h:X-Mailgun-Variables': JSON.stringify(payload),
                    'o:testmode': config.public.environment === 'development',
                })
            }

            case 'jobs': {
                return await $mg.messages.create(config.public.mailgun.domain, {
                    'to': config.public.mailgun.mailTo,
                    'subject': makeSubject('Employment Application'),
                    'template': 'employment-application',
                    'h:X-Mailgun-Variables': JSON.stringify(payload),
                    'o:testmode': config.public.environment === 'development',
                })
            }

            case 'newItem': {
                return await $mg.messages.create(config.public.mailgun.domain, {
                    'to': config.public.mailgun.mailTo,
                    'subject': makeSubject('New Item Request'),
                    'template': 'new-item',
                    'h:X-Mailgun-Variables': JSON.stringify(payload),
                    'o:testmode': config.public.environment === 'development',
                })
            }

            case 'survey': {
                return await $mg.messages.create(config.public.mailgun.domain, {
                    'to': config.public.mailgun.mailTo,
                    'subject': makeSubject('Survey'),
                    'template': 'survey',
                    'h:X-Mailgun-Variables': JSON.stringify(payload),
                    'o:testmode': config.public.environment === 'development',
                })
            }
            default: {
                return sendError(
                    event,
                    createError({
                        statusCode: StatusCodes.BAD_REQUEST,
                    }),
                )
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
