import { StatusCodes } from 'http-status-codes'

export default eventHandler(async (event) => {
    const { $db } = useNitroApp()
    const session = await useAuthSession(event)
    const { email, password } = await readBody(event)

    if (!email || !password) {
        return errorResponse(event, StatusCodes.BAD_REQUEST)
    }

    try {
        const user = await $db.client.adminUser.findUniqueOrThrow({
            where: {
                email,
            },
        })

        if (user.password !== (await hash(password))) {
            return errorResponse(event, StatusCodes.UNAUTHORIZED)
        }

        await session.update({
            id: user.uuid,
            email: user.email,
        })

        return successResponse(event, StatusCodes.OK, session.data)
    } catch (error) {
        return errorResponse(event, StatusCodes.UNAUTHORIZED)
    }
})
