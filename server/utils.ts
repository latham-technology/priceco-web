export interface EmailData {
  from: string
  to: string
  subject: string
  html: string
  text?: string
  'amp-html'?: string
  attachment?: {
    size: number
    url: string
    name: string
    'content-type': string
  }[]
  cc?: string
  bcc?: string
  't:version'?: string
  'h-Reply-To'?: string
  'o:testmode'?: boolean
}

function urlEncodeObject(object: { [s: string]: any }) {
  return Object.keys(object)
    .map(
      (key) => encodeURIComponent(key) + '=' + encodeURIComponent(object[key])
    )
    .join('&')
}

export function sendMail(data: EmailData, config) {
  const dataUrlEncoded = urlEncodeObject(data)
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(
        `api:${config.mailgun.NUXT_MAILGUN_API_KEY}`
      )}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': dataUrlEncoded.length.toString(),
    },
    body: dataUrlEncoded,
  }

  try {
    console.log(useRuntimeConfig())
  } catch (e) {}

  return fetch(`${config.public.mailgun.baseUrl}/messages`, options)
}
