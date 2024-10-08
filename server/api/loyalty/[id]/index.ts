import { StatusCodes } from 'http-status-codes'
import type { H3Event } from 'h3'
import { useConstants } from '~/composables/useConstants'
import { successResponse, errorResponse } from '~/server/utilities'

export default defineEventHandler((event) => {
    const method = event.node.req.method

    switch (method) {
        case 'GET':
            return handleGet(event)
        case 'POST':
            return handlePost(event)
        case 'PUT':
            return handlePut(event)
        case 'DELETE':
            return handleDelete(event)
        default:
            return errorResponse(
                event,
                StatusCodes.METHOD_NOT_ALLOWED,
            )
    }
})

const handleGet = async (event: H3Event) => {
    await requireAuthSession(event)
    const { $db, $sentry } = useNitroApp()

    try {
        const constants = useConstants()
        const { id } = getRouterParams(event)

        if (!id)
            return errorResponse(
                event,
                StatusCodes.BAD_REQUEST,
                constants.API_SCHEMA_VALIDATION_FAILED,
            )

        try {
            const result = await $db.client.loyalty.findFirstOrThrow({
                where: {
                    id: parseInt(id),
                },
                include: {
                    user: true,
                },
            })

            return successResponse(event, StatusCodes.OK, result)
        } catch (error) {
            return errorResponse(event, StatusCodes.NOT_FOUND)
        }
    } catch (error: any) {
        $sentry.captureException(error)
        return errorResponse(event, StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

const handlePost = async (event: H3Event) => {
    await requireAuthSession(event)

    return errorResponse(event, StatusCodes.METHOD_NOT_ALLOWED)
}
const handlePut = async (event: H3Event) => {
    await requireAuthSession(event)
    const { $db, $sentry } = useNitroApp()
    const { id } = getRouterParams(event)
    const body = await readBody(event)

    try {
        const result = await $db.client.loyalty.update({
            where: {
                id: parseInt(id),
            },
            data: body,
            include: {
                user: true,
            },
        })

        return successResponse(event, StatusCodes.OK, result)
    } catch (error) {
        $sentry.captureException(error)
        return errorResponse(event, StatusCodes.BAD_REQUEST)
    }
}
const handleDelete = async (event: H3Event) => {
    await requireAuthSession(event)
    const { $db, $sentry } = useNitroApp()
    const { id } = getRouterParams(event)

    try {
        const result = await $db.client.loyalty.delete({
            where: {
                id: parseInt(id),
            },
            include: {
                user: true,
            },
        })

        return successResponse(event, StatusCodes.OK, result)
    } catch (error) {
        $sentry.captureException(error)
        return errorResponse(event, StatusCodes.BAD_REQUEST)
    }
}
