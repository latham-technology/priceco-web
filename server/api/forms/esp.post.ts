import { createError } from 'h3'
import type { H3Event } from 'h3'
import type { KVNamespace } from '@cloudflare/workers-types'
import { StatusCodes, getReasonPhrase } from 'http-status-codes'
import emailSavingsTemplate from '../../email-templates/email-savings'
import type { EmailSavingsFormData } from '~~/types'
import { sendMail } from '~~/server/utils'

declare const ESP_STORE: KVNamespace

export default defineEventHandler(async (event: H3Event) => {
  let body: EmailSavingsFormData

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

  try {
    await ESP_STORE.put(
      body.contact.phone.replace(/\D/g, ''),
      JSON.stringify({
        contact: body.contact,
        address: body.address,
      })
    )

    try {
      const html = emailSavingsTemplate(body)
      const resp = await sendMail({
        to: 'lath.mj@gmail.com',
        from: 'no-reply@pricecofoods.org',
        subject: 'Email Savings Application',
        html,
        'h-Reply-To': body.contact.email,
      })

      return await resp.text()
    } catch (error) {
      console.log(error)
    }
  } catch (error) {
    console.log(error)
  }
})
