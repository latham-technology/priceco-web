import { StatusCodes } from 'http-status-codes'
import { successResponse } from '~/server/utilities'

export default eventHandler(async (event) => {
    const session = await useAuthSession(event)

    await session.clear()

    return successResponse(event, StatusCodes.OK)
})
