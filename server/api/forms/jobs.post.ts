import { H3Event } from 'h3'
import jobsTemplate from '../../email-templates/jobs'
import { sendMail } from '~~/server/utils'
import { JobsFormData } from '~~/types'

export default defineEventHandler(async (event: H3Event) => {
  let body: JobsFormData

  if (Buffer.isBuffer(event.req.body)) {
    body = JSON.parse(event.req.body.toString('utf8'))
  } else {
    body = await readBody(event)
  }

  const html = jobsTemplate(body)

  const resp = await sendMail({
    to: 'lath.mj@gmail.com',
    from: 'no-reply@pricecofoods.org',
    subject: 'Employment Application',
    html,
    'h-Reply-To': body.personal.email,
  })

  return await resp.text()
})
