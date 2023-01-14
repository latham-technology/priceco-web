import { H3Event, createError } from 'h3'
import { StatusCodes } from 'http-status-codes'
import { sendMail } from '~~/server/utils'
import { SurveyFormData } from '~~/types'
import { useConstants } from '~~/utils/useConstants'

const constants = useConstants()

export default defineEventHandler(async (event: H3Event) => {
  let body: SurveyFormData

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

  const email = surveryEmailTemplate(body)

  return await sendMail(email, useRuntimeConfig())
})

function surveryEmailTemplate(data: SurveyFormData) {
  return {
    to: 'lath.mj@gmail.com',
    from: 'no-reply@pricecofoods.org',
    subject: 'Customer Survey',
    'h-Reply-To': data.contact.email,
    html: `
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
          <td>Email:</td>
          <td><a href="mailto:${data.contact.email}">${
      data.contact.email
    }</a></td>
        </tr>
        <tr>
          <td>Phone:</td>
          <td><a href="tel:${data.contact.phone.replace(/\D/g, '')}">${
      data.contact.phone
    }</a></td>
        </tr>
        <tr>
          <td>Prefered Contact:</td>
          <td>${data.contact.preferredContactMethod}</td>
        </tr>
        <tr style="background: #eee;">
          <td colspan="2"><b>Demographics</b></td>
        </tr>
        <tr>
          <td>Shops At:</td>
          <td>
            ${
              data.survey.shoppedStores.length
                ? data.survey.shoppedStores.join(', ')
                : 'None Selected'
            }
          </td>
        </tr>
        <tr>
          <td>Would Order Online:</td>
          <td>${data.survey.wouldOrderOnline ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <td>Uses Coupons:</td>
          <td>${data.survey.useCoupons ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <td>Aware of the senior discount:</td>
          <td>${data.survey.awareOfSeniorDiscount ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <td>Tried recipe suggestions:</td>
          <td>${data.survey.hasTriedRecipeSuggestions ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <td>Comments:</td>
          <td>${data.comments}</td>
        </tr>
        <tr style="background: #eee;">
          <td colspan="2"><b>Survey</b>
          <br />
          5 = Great. 1 = Bad. 0 = No Answer.</td>
        </tr>
  
        ${Object.keys(data.ratings)
          .map(
            (key) => `
            <tr>
              <td>${key.charAt(0).toUpperCase()}${key.slice(1)}:</td>
              <td>${data.ratings[key] === null ? 0 : data.ratings[key]}</td>
            </tr>
          `
          )
          .join('')}
      </table>
    </body>
  </html>
  `.replaceAll('\n', ''),
  }
}
