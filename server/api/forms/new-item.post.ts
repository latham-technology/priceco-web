import { H3Event, createError } from 'h3'
import { StatusCodes, getReasonPhrase } from 'http-status-codes'
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

  const html = newItemEmailTemplate(body)

  return await sendMail({
    to: 'lath.mj@gmail.com',
    from: 'no-reply@pricecofoods.org',
    subject: 'Online Item Request',
    html,
  })
})

function newItemEmailTemplate(data: NewItemFormData) {
  return `
  <html>
    <body>
      <table rules="all" style="border-color: #666;" cellpadding="10">
        <tr style="background: #eee;">
          <td colspan="2"><b>Customer Information</b></td>
        </tr>
        <tr>
          <td>Name:</td>
          <td>${data.contact.name}</td>
        </tr>
        <tr>
          <td>Phone:</td>
          <td><a href="tel:${data.contact.phone.replace(/\D/g, '')}">${
    data.contact.phone
  }</a></td>
        </tr>
        <tr style="background: #eee;">
          <td colspan="2"><b>Item Information</b></td>
        </tr>
        <tr>
          <td>Brand:</td>
          <td>${data.item.brand}</td>
        </tr>
        <tr>
          <td>Description:</td>
          <td>${data.item.description}</td>
        </tr>
        <tr>
          <td>Size:</td>
          <td>${data.item.size}</td>
        </tr>
        <tr>
          <td>Last Bought At:</td>
          <td>${data.item.lastPurchased}</td>
        </tr>
        <tr>
          <td>Additional Info:</td>
          <td>${data.item.additionalInformation}</td>
        </tr>
      </table>
    </body>
	</html>
  `.replaceAll('\n', '')
}