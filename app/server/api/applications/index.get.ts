import { StatusCodes } from 'http-status-codes'
import { useConstants } from '~/composables/useConstants'
import { successResponse, errorResponse } from '~/server/utilities'

export default defineEventHandler(async (event) => {
    try {
        await requireAuthSession(event)
    } catch (error) {
        if (isError(error)) {
            return errorResponse(
                event,
                error.statusCode,
                error.statusMessage,
            )
        }
    }

    const constants = useConstants()
    const { $db } = useNitroApp()

    try {
        const results = await $db.client.application.findMany({
            include: {
                user: true,
                education: true,
                history: true,
                references: true,
            },
            ...usePagination(event),
        })

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
