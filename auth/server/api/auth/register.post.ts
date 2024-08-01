import { StatusCodes } from 'http-status-codes'
import { adminUserSchema } from '~/server/schemas/adminUser'
import { errorResponse } from '~/server/utilities'

export default eventHandler(async (event) => {
    const authHeader = getHeader(event, 'x-priceco-admin-token')

    if (!authHeader || authHeader !== 'Letmein!') {
        return errorResponse(event, StatusCodes.UNAUTHORIZED)
    }

    const { $db, $sentry } = useNitroApp()
    const body = await readBody(event)

    try {
        const data = await adminUserSchema.validate(body)

        return await $db.createAdminUser(data)
    } catch (error) {
        $sentry.captureException(error)
        return errorResponse(event, StatusCodes.BAD_REQUEST)
    }
})
