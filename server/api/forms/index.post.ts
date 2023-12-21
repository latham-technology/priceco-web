import { StatusCodes } from 'http-status-codes'
import type {
  SurveyFormData,
  JobsFormData,
  EmailSavingsFormData,
  NewItemFormData,
} from '@/types'
import { sendMail } from '~/server/utils'

type Payload = {
  type: 'esp' | 'jobs' | 'newItem' | 'survey'
  payload:
    | SurveyFormData
    | JobsFormData
    | EmailSavingsFormData
    | NewItemFormData
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Payload>(event)

  if (!(await verifyTurnstileToken(body.payload._turnstile))) {
    return sendError(
      event,
      createError({
        statusCode: StatusCodes.BAD_REQUEST,
        message: useConstants().API_TURNSTILE_VERIFICATION_FAILED,
      })
    )
  }

  try {
    switch (body.type) {
      case 'esp': {
        await sendMailWithTemplate('Email Savings Application', body.payload)
      }
    }
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error?.message,
      })
    )
  }
})
