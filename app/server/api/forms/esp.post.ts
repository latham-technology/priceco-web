import { createError } from 'h3'
import type { H3Event } from 'h3'
import type { KVNamespace } from '@cloudflare/workers-types'
import { StatusCodes } from 'http-status-codes'
import type { EmailSavingsFormData } from '@/types'
import { sendMail } from '@/server/utils'
import { useConstants } from '@/utils/useConstants'

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

    const key = body.contact.phone.replace(/\D/g, '').trim()

    if ((await ESP_STORE.get(key)) === null) {
        await ESP_STORE.put(
            key,
            JSON.stringify({
                contact: body.contact,
                address: body.address,
            }),
        )
    } else {
        throw createError({
            status: StatusCodes.BAD_REQUEST,
            message: constants.API_ESP_RECORD_EXISTS,
        })
    }

    return await sendMail({
        'to': [
            'esp@pricecofoods.org',
            useRuntimeConfig().public.mailgun.mailTo,
        ].join(','),
        'from': useRuntimeConfig().public.mailgun.sender,
        'subject':
            'Submission from pricecofoods.org: Email Savings Application',
        'h-Reply-To': body.contact.email,
        'html': `
<html>
  <body>
    <table rules="all" style="border-color: #666;" cellpadding="10">
      <tr style="background: #eee;">
        <td colspan="2"><b>Customer Information</b></td>
      </tr>
      <tr>
        <td>Name:</td>
        <td>${(
            body.contact.firstName +
            ' ' +
            body.contact.lastName
        ).trim()}</td>
      </tr>
      <tr>
        <td>Email:</td>
        <td><a href="mailto:${body.contact.email}">${
            body.contact.email
        }</a></td>
      </tr>
      <tr>
        <td>Phone:</td>
        <td>
          <a href="tel:${body.contact.phone.replace(/\D/g, '')}">${
              body.contact.phone
          }</a>
        </td>
      </tr>
      <tr>
        <td>Address:</td>
        <td>
          ${body.address.line1}<br />
          ${body.address.line2}
          <br />
          ${body.address.city}, ${body.address.state} ${body.address.zip}
        </td>
      </tr>
      <tr style="background: #eee;">
        <td colspan="2"><b>Demographics</b></td>
      </tr>
      <tr>
        <td>Use Coupons:</td>
        <td>${body.survey.useCoupons ?? 'No answer'}</td>
      </tr>
      <tr>
        <td>Aware of the senior discount:</td>
        <td>${body.survey.awareOfSeniorDiscount ?? 'No answer'}</td>
      </tr>
      <tr>
        <td>Heard about ESP by:</td>
        <td>${body.survey.referral ?? 'No answer'}</td>
      </tr>
      <tr>
        <td>Comments:</td>
        <td>${body.survey.comments}</td>
      </tr>
    </table>
  </body>
</html>
  `.replaceAll('\n', ''),
    }).then((response) => response.json())
})
