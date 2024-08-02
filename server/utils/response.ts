import { StatusCodes } from 'http-status-codes'
import { readBody, H3Event } from 'h3'
import { useConstants } from '~/composables/useConstants'

export function errorResponse(
    event: H3Event,
    code: number,
    message = '',
    data: object | null = null,
) {
    event.node.res.statusCode = code
    event.node.res.setHeader('content-type', 'application/json')

    return event.node.res.end(
        JSON.stringify({
            status: 'error',
            message,
            code,
            data,
        }),
    )
}

export function failResponse(
    event: H3Event,
    data: object | null = null,
) {
    event.node.res.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    event.node.res.setHeader('content-type', 'application/json')

    return event.node.res.end(
        JSON.stringify({
            status: 'fail',
            data,
        }),
    )
}

export function successResponse(
    event: H3Event,
    code = 200,
    data: object | null = null,
) {
    event.node.res.statusCode = code
    event.node.res.setHeader('content-type', 'application/json')

    return event.node.res.end(
        JSON.stringify({
            status: 'success',
            data,
        }),
    )
}

export async function verifyTurnstile(event: H3Event) {
    const { _turnstile } = await readBody(event)
    const { success } = await verifyTurnstileToken(_turnstile)

    if (!success) {
        throw new Error(
            useConstants().API_TURNSTILE_VERIFICATION_FAILED,
        )
    }
}
