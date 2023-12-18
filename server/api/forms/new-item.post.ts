import { H3Event, createError } from 'h3'
import { StatusCodes } from 'http-status-codes'
import { sendMail } from '@/server/utils'
import type { NewItemFormData } from '@/types'
import { useConstants } from '@/utils/useConstants'

const constants = useConstants()

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
      status: StatusCodes.BAD_REQUEST,
      message: constants.API_TURNSTILE_VERIFICATION_FAILED,
    })
  }

  return await sendMail({
    to: [
      'orders@pricecofoods.org',
      useRuntimeConfig().public.mailgun.mailTo,
    ].join(','),
    from: useRuntimeConfig().public.mailgun.sender,
    subject: 'Submission from pricecofoods.org: Online Item Request',
    html: `
  <html>
    <body>
      <table rules="all" style="border-color: #666;" cellpadding="10">
        <tr style="background: #eee;">
          <td colspan="2"><b>Customer Information</b></td>
        </tr>
        <tr>
          <td>Name:</td>
          <td>${body.contact.name}</td>
        </tr>
        <tr>
          <td>Phone:</td>
          <td><a href="tel:${body.contact.phone.replace(/\D/g, '')}">${
      body.contact.phone
    }</a></td>
        </tr>
        <tr style="background: #eee;">
          <td colspan="2"><b>Item Information</b></td>
        </tr>
        <tr>
          <td>Brand:</td>
          <td>${body.item.brand}</td>
        </tr>
        <tr>
          <td>Description:</td>
          <td>${body.item.description}</td>
        </tr>
        <tr>
          <td>Size:</td>
          <td>${body.item.size}</td>
        </tr>
        <tr>
          <td>Last Bought At:</td>
          <td>${body.item.lastPurchased}</td>
        </tr>
        <tr>
          <td>Additional Info:</td>
          <td>${body.item.additionalInformation}</td>
        </tr>
      </table>
    </body>
	</html>
  `.replaceAll('\n', ''),
  }).then((response) => response.json())
})
