import { StatusCodes } from 'http-status-codes'
import { errorResponse } from '~/server/utils/response'

export default eventHandler(async (event) => {
    const authHeader = getHeader(event, 'x-priceco-admin-token')

    if (!authHeader || authHeader !== 'Letmein!') {
        return errorResponse(event, StatusCodes.UNAUTHORIZED)
    }

    const body = await readBody(event)

    if (!body || !body.email || !body.password) {
        return errorResponse(event, StatusCodes.BAD_REQUEST)
    }

    const { $db } = useNitroApp()

    try {
        return await $db.createAdminUser({
            email: body.email,
            password: await hash(body.password),
        })
    } catch (error) {
        console.log(error)
        return failResponse(event)
    }
})
