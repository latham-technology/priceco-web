import { createError } from 'h3'
import type { H3Event } from 'h3'
import type { KVNamespace } from '@cloudflare/workers-types'
import { StatusCodes } from 'http-status-codes'
import type { EmailSavingsFormData } from '~~/types'
import { sendMail } from '~~/server/utils'
import { useConstants } from '~~/utils/useConstants'

declare const ESP_STORE: KVNamespace

const constants = useConstants()

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
      status: StatusCodes.BAD_REQUEST,
      message: constants.API_TURNSTILE_VERIFICATION_FAILED,
    })
  }

  const key = body.contact.phone.replace(/\D/g, '')

  if ((await ESP_STORE.get(key)) === null) {
    await ESP_STORE.put(
      key,
      JSON.stringify({
        contact: body.contact,
        address: body.address,
      })
    )
  } else {
    throw createError({
      status: StatusCodes.BAD_REQUEST,
      message: constants.API_ESP_RECORD_EXISTS,
    })
  }

  const email = emailSavingsEmailTemplate(body)

  return await sendMail(email, useRuntimeConfig())
})

function emailSavingsEmailTemplate(data: EmailSavingsFormData) {
  return {
    to: 'priceco-test@mattlatham.dev',
    from: 'no-reply@pricecofoods.org',
    subject: 'Email Savings Application',
    'h-Reply-to': data.contact.email,
    html: `
<html>
  <body>
    <table rules="all" style="border-color: #666;" cellpadding="10">
      <tr style="background: #eee;">
        <td colspan="2"><b>Customer Information</b></td>
      </tr>
      <tr>
        <td>Name:</td>
        <td>${(
          data.contact.firstName +
          ' ' +
          data.contact.lastName
        ).trim()}</td>
      </tr>
      <tr>
        <td>Email:</td>
        <td><a href="mailto:${data.contact.email}">${
      data.contact.email
    }</a></td>
      </tr>
      <tr>
        <td>Phone:</td>
        <td>
          <a href="tel:${data.contact.phone.replace(/\D/g, '')}">${
      data.contact.phone
    }</a>
        </td>
      </tr>
      <tr>
        <td>Address:</td>
        <td>
          ${data.address.line1}<br />
          ${data.address.line2}
          <br />
          ${data.address.city}, ${data.address.state} ${data.address.zip}
        </td>
      </tr>
      <tr style="background: #eee;">
        <td colspan="2"><b>Demographics</b></td>
      </tr>
      <tr>
        <td>Use Coupons:</td>
        <td>${data.survey.useCoupons ? 'Yes' : 'No'}</td>
      </tr>
      <tr>
        <td>Aware of the senior discount:</td>
        <td>${data.survey.awareOfSeniorDiscount ? 'Yes' : 'No'}</td>
      </tr>
      <tr>
        <td>Heard about ESP by:</td>
        <td>${data.survey.referral}</td>
      </tr>
      <tr>
        <td>Comments:</td>
        <td>${data.survey.comments}</td>
      </tr>
    </table>
  </body>
</html>
  `.replaceAll('\n', ''),
  }
}
