import { H3Event } from 'h3'
import surveryTemplate from '../../email-templates/survey'
import { sendMail } from '~~/server/utils'
import { SurveyFormData } from '~~/types'

export default defineEventHandler(async (event: H3Event) => {
  let body: SurveyFormData

  if (Buffer.isBuffer(event.req.body)) {
    body = JSON.parse(event.req.body.toString('utf8'))
  } else {
    body = await readBody(event)
  }

  const html = surveryTemplate(body)

  const resp = await sendMail({
    to: 'lath.mj@gmail.com',
    from: 'no-reply@pricecofoods.org',
    subject: 'Customer Survey',
    html,
    'h-Reply-To': body.contact.email,
  })

  return await resp.text()
})
