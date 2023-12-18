import { H3Event, createError } from 'h3'
import { StatusCodes } from 'http-status-codes'
import { sendMail } from '@/server/utils'
import type { JobsFormData } from '@/types'
import { useConstants } from '@/utils/useConstants'

const constants = useConstants()

export default defineEventHandler(async (event: H3Event) => {
  let body: JobsFormData

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

  return await sendMail({
    to: [
      'jobs@pricecofoods.org',
      useRuntimeConfig().public.mailgun.mailTo,
    ].join(','),
    from: useRuntimeConfig().public.mailgun.sender,
    subject: 'Employment Application',
    'h-Reply-To': body.personal.email,
    html: `
  <html>
  <body>
    <table rules="all" style="border-color: #666" cellpadding="10">
      <tr style="background: #eee">
        <td colspan="2"><b>Personal Information</b></td>
      </tr>
      <tr>
        <td>Name:</td>
        <td>${(
          body.personal.firstName +
          ' ' +
          body.personal.lastName
        ).trim()}</td>
      </tr>
      <tr>
        <td>Address:</td>
        <td>
          ${body.personal.address1}<br />
          ${body.personal.address2 ? body.personal.address2 + '<br />' : ''}
          ${body.personal.city}, ${body.personal.state} ${body.personal.zip}
        </td>
      </tr>
      <tr>
        <td>Phone:</td>
        <td><a href="tel:${body.personal.phone.replace(/\D/g, '')}">${
      body.personal.phone
    }</a></td>
      </tr>
      ${
        body.personal.email
          ? `
          <tr>
            <td>Email:</td>
            <td><a href="mailto:${body.personal.email}">${body.personal.email}</a></td>
          </tr>
        `
          : ''
      }
      <tr>
        <td>Felony Conviction:</td>
        <td>${body.personal.felony ? 'Yes' : 'No'}</td>
      </tr>

      ${
        body.personal.felonyDescription
          ? `
        <tr>
          <td>Felony Description:</td>
          <td>${body.personal.felonyDescription}</td>
        </tr>
        `
          : ''
      }

      <tr style="background: #eee">
        <td colspan="2"><b>Employment Desired</b></td>
      </tr>
      <tr>
        <td>Position:</td>
        <td>${body.position.desired}</td>
      </tr>
      <tr>
        <td>Date Available:</td>
        <td>${body.position.dateAvailable}</td>
      </tr>
      <tr>
        <td>Salary Desired:</td>
        <td>${body.position.salary}</td>
      </tr>
      <tr>
        <td>Full Time/Part Time:</td>
        <td>${body.position.availability}</td>
      </tr>
      <tr>
        <td>Currently Employed:</td>
        <td>${body.position.currentlyEmployed ? 'Yes' : 'No'}</td>
      </tr>

      <tr style="background: #eee">
        <td colspan="2"><b>Education</b></td>
      </tr>
      ${body.education
        .map(
          (education) => `
          <tr>
            <td>${
              education.type === 'primary' ? 'Primary' : 'Secondary'
            } School:</td>
            <td>${education.name}</td>
          </tr>
          <tr>
            <td>Location:</td>
            <td>${education.location}</td>
          </tr>
          <tr>
            <td>Studied:</td>
            <td>${education.subjects}</td>
          </tr>
          <tr>
            <td>Completed:</td>
            <td>${education.complete ? 'Yes' : 'No'}</td>
          </tr>
        `
        )
        .join('')}

      <tr style="background: #eee">
        <td colspan="2"><b>Work History</b></td>
      </tr>
      ${body.history
        .map(
          (history, index) => `
          <tr>
            <td>Employer ${index + 1}:</td>
            <td>${history.name}</td>
          </tr>
          <tr>
            <td>Location:</td>
            <td>${history.location}</td>
          </tr>
          <tr>
            <td>Title:</td>
            <td>${history.title}</td>
          </tr>
          <tr>
            <td>Duration:</td>
            <td>${history.datesEmployed}</td>
          </tr>
          <tr>
            <td>Reason for Leaving:</td>
            <td>${history.leaveReason}</td>
          </tr>
        `
        )
        .join('')}
      
      <tr style="background: #eee">
        <td colspan="2"><b>References</b></td>
      </tr>
      ${body.references
        .map(
          (reference, index) => `
          <tr>
            <td>Reference ${index + 1}:</td>
            <td>${reference.name}</td>
          </tr>
          <tr>
            <td>Location:</td>
            <td>${reference.address}</td>
          </tr>
          <tr>
            <td>Phone:</td>
            <td>${reference.phone}</td>
          </tr>
          <tr>
            <td>Years Known:</td>
            <td>${reference.yearsKnown}</td>
          </tr>
        `
        )
        .join('')}

    </table>
  </body>
</html>
  `.replaceAll('\n', ''),
  })
})
