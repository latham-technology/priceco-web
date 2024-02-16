import { StatusCodes } from 'http-status-codes'
import { readBody, send, H3Event } from 'h3'
import { useConstants } from '~/composables/useConstants'

export function errorResponse(
    message = '',
    code: number,
    data: object | null = null,
) {
    return {
        status: 'error',
        message,
        code,
        data,
    }
}

export function failResponse(data: object | null = null) {
    return {
        status: 'fail',
        data,
    }
}

export function successResponse(data: object | null = null) {
    return {
        status: 'success',
        data,
    }
}

export async function verifyTurnstile(event: H3Event) {
    const { _turnstile } = await readBody(event)
    const { success } = await verifyTurnstileToken(_turnstile)

    if (!success) {
        send(
            event,
            errorResponse(
                useConstants().API_TURNSTILE_VERIFICATION_FAILED,
                StatusCodes.BAD_REQUEST,
            ),
        )
    }
}
