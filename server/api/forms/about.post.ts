import { H3Event } from 'h3'
import surveryTemplate from '../../email-templates/survey'

const sendMail = async (params) => {
  console.log('params', params)
  const request = new Request('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  return await fetch(request)
}

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)

  console.log(body)

  const html = surveryTemplate(body)

  console.log('html', html)

  const resp = await sendMail({
    personalizations: [
      {
        to: 'lath.mj@gmail.com',
        name: 'Test Recipient',
      },
    ],
    from: {
      email: 'noreply@pricecofoods.org',
      name: 'Test Sender',
    },
    subjest: 'Test',
    content: [
      {
        type: 'text/html',
        value: html,
      },
    ],
  })

  return { foo: 'bar' }
})
