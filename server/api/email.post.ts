import { StatusCodes } from 'http-status-codes'
import type { FeedbackInput } from '../schemas/feedback'
import type {
    EmailSavingsFormData,
    JobsFormData,
    NewItemFormData,
} from '~/types'
import { ensureError } from '~/utils'

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
    payload: FeedbackInput
}

type EmploymentRequestBody = {
    type: 'employment-application'
    payload: JobsFormData
}

type RequestBody = (
    | EmploymentRequestBody
    | EmailSavingsRequestBody
    | NewItemRequestBody
    | SurveyRequestBody
) & {
    email?: string
    _turnstile: string
}

export default defineEventHandler(async (event) => {
    await requireAuthSession(event)
    const { $mailer, $sentry } = useNitroApp()
    const {
        type,
        payload,
        email = null,
    } = await readBody<RequestBody>(event)

    try {
        switch (type) {
            case 'newItem': {
                return await $mailer.sendMail(payload, {
                    subject: $mailer.makeSubject('New Item Request'),
                    template: 'new-item',
                    email,
                })
            }

            case 'survey': {
                return await $mailer.sendMail(payload, {
                    subject: $mailer.makeSubject('Survey'),
                    template: 'survey',
                    email,
                })
            }

            case 'employment-application': {
                return await $mailer.sendMail(payload, {
                    subject: $mailer.makeSubject(
                        'Employment Application',
                    ),
                    template: 'employment-application',
                    email,
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

        $sentry.captureException(error)

        sendError(
            event,
            createError({
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                ...error,
            }),
        )
    }
})
