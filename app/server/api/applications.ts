import { StatusCodes } from 'http-status-codes'
import { useConstants } from '~/composables/useConstants'
import {
    successResponse,
    errorResponse,
    failResponse,
    verifyTurnstile,
} from '~/server/utilities'
import type { JobsFormData } from '~/types'

const postSchema = yup.object().shape({})

export default defineEventHandler(async (event) => {
    const constants = useConstants()
    const config = useRuntimeConfig()
    const { mailer, db } = useNitroApp()
    const body = await readBody(event)

    const { _turnstile } = await readBody(event)
    const { success } = await verifyTurnstileToken(_turnstile)

    if (!success) {
        return errorResponse(
            useConstants().API_TURNSTILE_VERIFICATION_FAILED,
            StatusCodes.BAD_REQUEST,
        )
    }
})
