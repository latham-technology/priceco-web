import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import type { IMailgunClient } from 'mailgun.js/Interfaces'

declare module 'nitropack' {
	interface NitroApp {
		mg: IMailgunClient
	}
}

export default defineNitroPlugin((nitroApp) => {
	const mailgun = new Mailgun(FormData)

	const mg = mailgun.client({
		username: 'api',
		key: import.meta.env.NUXT_MAILGUN_API_KEY,
	})

	nitroApp.mg = mg
})
