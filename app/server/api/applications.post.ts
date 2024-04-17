import { StatusCodes } from 'http-status-codes'
import applicationSchema from '../schemas/application'
import { useConstants } from '~/composables/useConstants'
import {
    successResponse,
    errorResponse,
    verifyTurnstile,
} from '~/server/utilities'
import type { JobsFormData } from '~/types'

export default defineEventHandler(async (event) => {
    const constants = useConstants()
    const { mailer, db } = useNitroApp()

    const { _turnstile, ...body } = await readBody(event)

    try {
        await verifyTurnstile(event)

        const data = await applicationSchema.validate(body, {
            abortEarly: false,
        })

        const result = await db.createApplication(
            data as JobsFormData,
        )

        try {
            mailer.sendMail(data, {
                subject: mailer.makeSubject('Employment Application'),
                template: 'employment-application',
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

        return errorResponse(
            event,
            StatusCodes.BAD_REQUEST,
            constants.API_SCHEMA_VALIDATION_FAILED,
            error.errors ?? [error.message],
        )
    }
})
