import { StatusCodes } from 'http-status-codes'

export default eventHandler(async (event) => {
    const session = await useAuthSession(event)

    await session.clear()

    return successResponse(event, StatusCodes.OK)
})
