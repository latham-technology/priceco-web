import { StatusCodes } from 'http-status-codes'
import type { H3Event } from 'h3'
import dayjs from 'dayjs'
import { useConstants } from '~/composables/useConstants'
import { successResponse, errorResponse } from '~/server/utilities'
import applicationSchema from '~/server/schemas/application'

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
            $db.client.application.count({
                where,
            }),
            $db.client.application.findMany({
                include: {
                    user: true,
                    education: true,
                    history: true,
                    references: true,
                },
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

    const { _turnstile, ...body } = await readBody(event)

    try {
        // await verifyTurnstile(event)

        const data = await applicationSchema.validate(body)

        const result = await $db.createApplication(data)

        try {
            $mailer.sendMail(result, {
                'subject': $mailer.makeSubject(
                    'Employment Application',
                ),
                'template': 'employment-application',
                't:version': 'v4',
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
    const { $db, $sentry } = useNitroApp()
    const body = await readBody(event)

    if (!body.updates) {
        return errorResponse(event, StatusCodes.BAD_REQUEST)
    }

    try {
        const results = await $db.client.$transaction(
            body.updates.map((update: any) => {
                const { id, ...payload } = update

                return $db.client.application.update({
                    where: {
                        id,
                    },
                    data: payload,
                    include: {
                        user: true,
                        education: true,
                        history: true,
                        references: true,
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

                return $db.client.application.delete({
                    where: {
                        id,
                    },
                    include: {
                        user: true,
                        education: true,
                        history: true,
                        references: true,
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
