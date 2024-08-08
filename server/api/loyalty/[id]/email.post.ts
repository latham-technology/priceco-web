import { StatusCodes } from 'http-status-codes'
import { ensureError } from '~/utils'

type LoyaltyEmailRequestPayload = {
    email: string
}

export default defineEventHandler(async (event) => {
    await requireAuthSession(event)
    const { $mailer, $sentry, $db } = useNitroApp()
    const { id } = getRouterParams(event)
    const { email } = await readBody<LoyaltyEmailRequestPayload>(
        event,
    )

    try {
        const loyalty = await $db.client.loyalty.findUnique({
            where: {
                id: parseInt(id),
            },
            include: {
                user: true,
            },
        })

        console.log(loyalty)

        const result = await $mailer.sendMail(loyalty, {
            'subject': $mailer.makeSubject(
                'Email Savings Application',
            ),
            'to': email,
            'template': 'email-savings',
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
