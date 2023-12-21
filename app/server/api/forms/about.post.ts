import { H3Event, createError } from 'h3'
import { StatusCodes } from 'http-status-codes'
import { sendMail } from '@/server/utils'
import type { SurveyFormData } from '@/types'
import { useConstants } from '@/utils/useConstants'

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

  try {
    return await sendMail({
      to: [
        useRuntimeConfig().public.mailgun.mailTo,
        'surveys@pricecofoods.org',
      ].join(','),
      from: useRuntimeConfig().public.mailgun.sender,
      subject: `Submission from pricecofoods.org: Customer Survey`,
      'h-Reply-To': body.contact.email,

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
            <td>Email:</td>
            <td><a href="mailto:${body.contact.email}">${
        body.contact.email
      }</a></td>
          </tr>
          <tr>
            <td>Phone:</td>
            <td><a href="tel:${body.contact.phone.replace(/\D/g, '')}">${
        body.contact.phone
      }</a></td>
          </tr>
          <tr>
            <td>Prefered Contact:</td>
            <td>${body.contact.preferredContactMethod}</td>
          </tr>
          <tr style="background: #eee;">
            <td colspan="2"><b>Demographics</b></td>
          </tr>
          <tr>
            <td>Shops At:</td>
            <td>
              ${
                body.survey.shoppedStores.length
                  ? body.survey.shoppedStores.join(', ')
                  : 'No answer'
              }
            </td>
          </tr>
          <tr>
            <td>Would Order Online:</td>
            <td>${body.survey.wouldOrderOnline ?? 'No answer'}</td>
          </tr>
          <tr>
            <td>Uses Coupons:</td>
            <td>${body.survey.useCoupons ?? 'No answer'}</td>
          </tr>
          <tr>
            <td>Aware of the senior discount:</td>
            <td>${body.survey.awareOfSeniorDiscount ?? 'No answer'}</td>
          </tr>
          <tr>
            <td>Tried recipe suggestions:</td>
            <td>${body.survey.hasTriedRecipeSuggestions ?? 'No answer'}</td>
          </tr>
          <tr>
            <td>Comments:</td>
            <td>${body.comments}</td>
          </tr>
          <tr style="background: #eee;">
            <td colspan="2"><b>Survey</b>
            <br />
            5 = Great. 1 = Bad. 0 = No Answer.</td>
          </tr>
    
          ${Object.keys(body.ratings)
            .map(
              (key) => `
              <tr>
                <td>${key.charAt(0).toUpperCase()}${key.slice(1)}:</td>
                <td>${body.ratings[key] === null ? 0 : body.ratings[key]}</td>
              </tr>
            `
            )
            .join('')}
        </table>
      </body>
    </html>
    `.replaceAll('\n', ''),
    }).then((response) => {
      console.log(response)

      if (response.status < 400) {
        return response.json()
      }
    })
  } catch (error) {
    console.error(error)
    return sendError(event, error as Error)
  }
})
