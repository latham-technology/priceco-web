import { StatusCodes } from 'http-status-codes'
import type { H3Event } from 'h3'
import { useConstants } from '~/composables/useConstants'
import { successResponse, errorResponse } from '~/server/utilities'
import feedbackSchema from '~/server/schemas/feedback'

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
    const { $db, $sentry } = useNitroApp()

    const { where, ...pagination } = useFilterQuery(event)

    try {
        const [count, results] = await $db.client.$transaction([
            $db.client.feedback.count({
                where,
            }),
            $db.client.feedback.findMany({
                where,
                ...pagination,
            }),
        ])

        return successResponse(event, StatusCodes.OK, {
            count,
            results,
        })
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

        $sentry.captureException(error)

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
    const { $mailer, $db, $sentry } = useNitroApp()

    const body = await readBody(event)

    try {
        const data = await feedbackSchema.validate(body)

        const result = await $db.createFeedback(data)

        try {
            $mailer.sendMail(data, {
                subject: $mailer.makeSubject('Survey'),
                template: 'survey',
            })
        } catch (error) {
            $sentry.captureException(error)
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

        $sentry.captureException(error)

        return errorResponse(
            event,
            StatusCodes.BAD_REQUEST,
            error.message,
        )
    }
}

const handlePut = async (event: H3Event) => {
    await requireAuthSession(event)
    const { $db, $sentry } = useNitroApp()
    const body = await readBody(event)

    if (!body.updates) {
        return errorResponse(event, StatusCodes.BAD_REQUEST)
    }

    try {
        const results = await $db.client.$transaction(
            body.updates.map((update: any) => {
                const { id, ...payload } = update

                return $db.client.feedback.update({
                    where: {
                        id,
                    },
                    data: payload,
                })
            }),
        )

        return successResponse(event, StatusCodes.ACCEPTED, {
            count: results.length,
            results,
        })
    } catch (error) {
        $sentry.captureException(error)
        return errorResponse(event, StatusCodes.BAD_REQUEST)
    }
}

const handleDelete = async (event: H3Event) => {
    await requireAuthSession(event)
    const { $db, $sentry } = useNitroApp()
    const body = await readBody(event)

    if (!body.updates) {
        return errorResponse(event, StatusCodes.BAD_REQUEST)
    }

    try {
        const results = await $db.client.$transaction(
            body.updates.map((update: any) => {
                const { id } = update

                return $db.client.feedback.delete({
                    where: {
                        id,
                    },
                })
            }),
        )

        return successResponse(event, StatusCodes.ACCEPTED, {
            count: results.length,
            results,
        })
    } catch (error) {
        $sentry.captureException(error)
        return errorResponse(event, StatusCodes.BAD_REQUEST)
    }
}
