import { StatusCodes } from 'http-status-codes'
import type { H3Event } from 'h3'
import { useConstants } from '~/composables/useConstants'
import { successResponse, errorResponse } from '~/server/utilities'
import applicationSchema from '~/server/schemas/application'
import type { JobsFormData } from '~/types'

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

    const constants = useConstants()
    const { $db } = useNitroApp()

    try {
        const { skip, take, orderBy } = usePagination(event)

        const results = await $db.client.application.findMany({
            include: {
                user: true,
                education: true,
                history: true,
                references: true,
            },
            skip,
            take,
            orderBy,
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
}

const handlePost = async (event: H3Event) => {
    const constants = useConstants()
    const { $mailer, $db } = useNitroApp()

    const { _turnstile, ...body } = await readBody(event)

    try {
        // await verifyTurnstile(event)

        const data = await applicationSchema.validate(body, {
            abortEarly: false,
        })

        const result = await $db.createApplication(
            data as JobsFormData,
        )

        try {
            $mailer.sendMail(data, {
                subject: $mailer.makeSubject(
                    'Employment Application',
                ),
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
}

const handlePut = async (event: H3Event) => {
    await requireAuthSession(event)

    return errorResponse(event, StatusCodes.METHOD_NOT_ALLOWED)
}

const handleDelete = async (event: H3Event) => {
    await requireAuthSession(event)

    return errorResponse(event, StatusCodes.METHOD_NOT_ALLOWED)
}
