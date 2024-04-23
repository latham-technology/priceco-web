import { StatusCodes } from 'http-status-codes'
import loyaltySchema from '../schemas/loyalty'
import { useConstants } from '~/composables/useConstants'
import {
    successResponse,
    errorResponse,
    verifyTurnstile,
} from '~/server/utilities'
import type { EmailSavingsFormData } from '~/types'

export default defineEventHandler(async (event) => {
    const constants = useConstants()
    const { $mailer, $db } = useNitroApp()

    const { _turnstile, ...body } = await readBody(event)

    try {
        // await verifyTurnstile(event)

        const data = await loyaltySchema.validate(body, {
            abortEarly: false,
        })

        const result = await $db.createLoyalty(
            data as EmailSavingsFormData,
        )

        try {
            $mailer.sendMail(data, {
                subject: $mailer.makeSubject(
                    'Email Savings Application',
                ),
                template: 'email-savings',
            })
        } catch (error) {
            console.error(error)
        }

        return successResponse(event, StatusCodes.CREATED, result)
    } catch (error: any) {
        if (
            error.message ===
            constants.API_TURNSTILE_VERIFICATION_FAILED
        ) {
            return errorResponse(
                event,
                StatusCodes.BAD_REQUEST,
                error.message,
            )
        }

        if (error.message === constants.API_LOYALTY_MAX_PER_USER) {
            return errorResponse(
                event,
                StatusCodes.CONFLICT,
                error.message,
            )
        }

        return errorResponse(
            event,
            StatusCodes.BAD_REQUEST,
            constants.API_SCHEMA_VALIDATION_FAILED,
            error.errors ?? [error.message],
        )
    }
})
