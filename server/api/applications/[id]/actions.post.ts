import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
    const user = await requireAuthSession(event)
    const { id } = getRouterParams(event)
    const { action } = getQuery(event)
    const { $db } = useNitroApp()

    if (!action) {
        return new Response('Action is required', { status: 400 })
    }

    try {
        const application = await $db.client.application.update({
            where: {
                id: parseInt(id),
            },
            data: {
                log: {
                    create: {
                        adminUserId: user.data.id as string,
                        action,
                    },
                },
            },
            include: {
                log: true,
            },
        })

        console.log(application)
    } catch (error) {
        console.error(error)
    }

    return 'foo'
})
