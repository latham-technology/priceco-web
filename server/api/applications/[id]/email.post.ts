import { StatusCodes } from 'http-status-codes'
import { ensureError } from '~/utils'

type ApplicationEmailRequestPayload = {
    email: string
}

export default defineEventHandler(async (event) => {
    await requireAuthSession(event)
    const { $mailer, $sentry, $db } = useNitroApp()
    const { id } = getRouterParams(event)
    const { email } = await readBody<ApplicationEmailRequestPayload>(
        event,
    )

    try {
        const application = await $db.client.application.findUnique({
            where: {
                id: parseInt(id),
            },
            include: {
                user: true,
                education: true,
                history: true,
                references: true,
            },
        })

        const result = await $mailer.sendMail(application, {
            'subject': $mailer.makeSubject('Employment Application'),
            'template': 'employment-application',
            'to': email,
            't:version': 'v4',
        })

        return successResponse(event, StatusCodes.CREATED, result)
    } catch (err) {
        const error = ensureError(err)

        $sentry.captureException(error)

        sendError(
            event,
            createError({
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                ...error,
            }),
        )
    }
})
