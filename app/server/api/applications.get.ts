import { StatusCodes } from 'http-status-codes'
import applicationSchema from '../schemas/application'
import { useConstants } from '~/composables/useConstants'
import {
    successResponse,
    errorResponse,
    verifyTurnstile,
} from '~/server/utilities'
import type { JobsFormData } from '~/types'

export default defineEventHandler(async (event) => {
    const constants = useConstants()
    const { mailer, db } = useNitroApp()

    try {
        const results = await db.client.application.findMany({
            include: {
                education: true,
                history: true,
                references: true,
                user: true,
            },
        })

        return successResponse(event, StatusCodes.OK, results)
    } catch (error) {
        return errorResponse(event, 500)
    }
})
