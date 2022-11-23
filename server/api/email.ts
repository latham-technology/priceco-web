import { createTransport } from 'nodemailer'

console.log(createTransport)

const transporter = createTransport({
  host: 'mail.mattlatham.dev',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: 'management@pricecofoods.org',
    pass: 'B&*Y%779G8E&v^8*k9z&'
  },
  logger: true
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const info = await transporter.sendMail({
    from: {
      address: 'noreply@pricecofoods.org',
      name: 'No Reply'
    },
    to: 'lath.mj@gmail.com',
    text: JSON.stringify(body)
  })

  return info
})
