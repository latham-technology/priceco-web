import type { H3Event } from 'h3'
import { StatusCodes } from 'http-status-codes'

export default async (event: H3Event) => {
    const config = useRuntimeConfig()

    if (!config.public.turnstile.enabled) return

    const { _turnstile } = await readBody(event)

    if (!(await verifyTurnstileToken(_turnstile))) {
        return sendError(
            event,
            createError({
                statusCode: StatusCodes.BAD_REQUEST,
                message: useConstants().API_TURNSTILE_VERIFICATION_FAILED,
            }),
        )
    }
}
