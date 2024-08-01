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

    try {
        const constants = useConstants()
        const { id } = getRouterParams(event)
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
                        log: true,
                    },
                })

            return successResponse(event, StatusCodes.OK, result)
        } catch (error) {
            return errorResponse(event, StatusCodes.NOT_FOUND)
        }
    } catch (error: any) {
        return failResponse(event)
    }
}

const handlePost = async (event: H3Event) => {
    await requireAuthSession(event)

    return errorResponse(event, StatusCodes.METHOD_NOT_ALLOWED)
}
const handlePut = async (event: H3Event) => {
    await requireAuthSession(event)
    const { $db } = useNitroApp()
    const { id } = getRouterParams(event)
    const body = await readBody(event)

    try {
        const result = await $db.client.application.update({
            where: {
                id: parseInt(id),
            },
            data: body,
            include: {
                education: true,
                history: true,
                references: true,
                log: true,
                user: true,
            },
        })

        return successResponse(event, StatusCodes.OK, result)
    } catch (error) {
        console.log(error)
        return errorResponse(event, StatusCodes.BAD_REQUEST)
    }
}
const handleDelete = async (event: H3Event) => {
    await requireAuthSession(event)
    const { $db } = useNitroApp()
    const { id } = getRouterParams(event)

    try {
        const result = await $db.client.application.delete({
            where: {
                id: parseInt(id),
            },
            include: {
                education: true,
                history: true,
                references: true,
                log: true,
                user: true,
            },
        })

        return successResponse(event, StatusCodes.OK, result)
    } catch (error) {
        console.log(error)
        return errorResponse(event, StatusCodes.BAD_REQUEST)
    }
}
