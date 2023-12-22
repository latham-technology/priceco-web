import { StatusCodes } from 'http-status-codes'
import type {
    SurveyFormData,
    JobsFormData,
    EmailSavingsFormData,
    NewItemFormData,
    RequestBody,
} from '@/types'

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
        const { NUXT_MAILGUN_DOMAIN: mgDomain } = process.env

        switch (type) {
            case 'esp': {
                return await mg.messages.create(mgDomain, {
                    'to': process.env.NUXT_MAILGUN_MAIL_TO,
                    'subject': getSubject('Email Savings Application'),
                    'template': 'email savings submission',
                    'h:X-Mailgun-Variables': JSON.stringify({
                        firstName: payload.contact.firstName,
                        lastName: payload.contact.lastName,
                        email: payload.contact.email,
                        phone: payload.contact.phone,
                        addressLine1: payload.address.line1,
                        addressLine2: payload.address.line2,
                        addressCity: payload.address.city,
                        addressState: payload.address.state,
                        addressZip: payload.address.zip,
                        usesCoupons: payload.survey.useCoupons,
                        awareOfSeniorDiscount:
                            payload.survey.awareOfSeniorDiscount,
                        referral: payload.survey.referral,
                        comments: payload.survey.comments,
                    }),
                })
            }

            case 'jobs': {
                return await mg.messages.create(mgDomain, {
                    to: process.env.NUXT_MAILGUN_MAIL_TO,
                    subject: getSubject('Employment Application'),
                })
            }
        }
    } catch (error) {
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

async function sendEspMail(body: EmailSavingsFormData) {
    const { mg } = useNitroApp()
}
