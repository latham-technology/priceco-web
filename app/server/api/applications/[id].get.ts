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

    try {
        const id = getRouterParam(event, 'id')
        const constants = useConstants()
        const { $db } = useNitroApp()

        if (!id)
            return errorResponse(
                event,
                StatusCodes.BAD_REQUEST,
                constants.API_SCHEMA_VALIDATION_FAILED,
            )

        try {
            const result =
                await $db.client.application.findFirstOrThrow({
                    where: {
                        id: parseInt(id),
                    },
                    include: {
                        user: true,
                        education: true,
                        history: true,
                        references: true,
                    },
                })

            return successResponse(event, StatusCodes.OK, result)
        } catch (error) {
            return errorResponse(event, StatusCodes.NOT_FOUND)
        }
    } catch (error: any) {
        return failResponse(event)
    }
})
