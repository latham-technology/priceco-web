import { H3Event, createError } from 'h3'
import { StatusCodes, getReasonPhrase } from 'http-status-codes'
import newItemTemplate from '../../email-templates/new-item'
import { sendMail } from '~~/server/utils'
import { NewItemFormData } from '~~/types'

export default defineEventHandler(async (event: H3Event) => {
  let body: NewItemFormData

  if (Buffer.isBuffer(event.req.body)) {
    body = JSON.parse(event.req.body.toString('utf8'))
  } else {
    body = await readBody(event)
  }

  const tokenVerification = await verifyTurnstileToken(body._turnstile)

  if (!tokenVerification.success) {
    throw createError({
      status: StatusCodes.NOT_ACCEPTABLE,
      statusText: getReasonPhrase(StatusCodes.NOT_ACCEPTABLE),
    })
  }

  const html = newItemTemplate(body)

  const resp = await sendMail({
    to: 'lath.mj@gmail.com',
    from: 'no-reply@pricecofoods.org',
    subject: 'Online Item Request',
    html,
  })

  return await resp.text()
})
