import { StatusCodes } from 'http-status-codes'
import { errorResponse, successResponse } from '~/server/utilities'

export default eventHandler(async (event) => {
    const { $db } = useNitroApp()
    const session = await useAuthSession(event)
    const { email, password } = await readBody(event)

    if (!email || !password) {
        return errorResponse(event, StatusCodes.BAD_REQUEST)
    }

    try {
        const user = await $db.client.adminUser.findUnique({
            where: {
                email,
            },
        })

        if (!user) {
            return errorResponse(event, StatusCodes.UNAUTHORIZED)
        }

        if (user.password !== (await hash(password))) {
            return errorResponse(event, StatusCodes.UNAUTHORIZED)
        }

        await session.update({
            id: user.id,
            email: user.email,
        })

        return successResponse(event, StatusCodes.OK, session.data)
    } catch (error) {
        return errorResponse(event, StatusCodes.INTERNAL_SERVER_ERROR)
    }
})
