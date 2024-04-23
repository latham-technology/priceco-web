import { StatusCodes } from 'http-status-codes'
import { useConstants } from '~/composables/useConstants'
import { successResponse, errorResponse } from '~/server/utilities'

export default defineEventHandler(async (event) => {
    const constants = useConstants()
    const { $db } = useNitroApp()

    try {
        const results = await $db.client.loyalty.findMany()

        return successResponse(event, StatusCodes.CREATED, results)
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
