import { H3Event, createError } from 'h3'
import { StatusCodes, getReasonPhrase } from 'http-status-codes'
import { sendMail } from '~~/server/utils'
import { JobsFormData } from '~~/types'

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
      status: StatusCodes.NOT_ACCEPTABLE,
      statusText: getReasonPhrase(StatusCodes.NOT_ACCEPTABLE),
    })
  }

  const html = jobsEmailTemplate(body)

  return await sendMail({
    to: 'lath.mj@gmail.com',
    from: 'no-reply@pricecofoods.org',
    subject: 'Employment Application',
    html,
    'h-Reply-To': body.personal.email,
  })
})

function jobsEmailTemplate(data: JobsFormData) {
  return `
  <html>
  <body>
    <table rules="all" style="border-color: #666" cellpadding="10">
      <tr style="background: #eee">
        <td colspan="2"><b>Personal Information</b></td>
      </tr>
      <tr>
        <td>Name:</td>
        <td>${(
          data.personal.firstName +
          ' ' +
          data.personal.lastName
        ).trim()}</td>
      </tr>
      <tr>
        <td>Address:</td>
        <td>
          ${data.personal.address1}<br />
          ${data.personal.address2 ? data.personal.address2 + '<br />' : ''}
          ${data.personal.city}, ${data.personal.state} ${data.personal.zip}
        </td>
      </tr>
      <tr>
        <td>Phone:</td>
        <td><a href="tel:${data.personal.phone.replace(/\D/g, '')}">${
    data.personal.phone
  }</a></td>
      </tr>
      ${
        data.personal.email
          ? `
          <tr>
            <td>Email:</td>
            <td><a href="mailto:${data.personal.email}">${data.personal.email}</a></td>
          </tr>
        `
          : ''
      }
      <tr>
        <td>Felony Conviction:</td>
        <td>${data.personal.felony ? 'Yes' : 'No'}</td>
      </tr>

      ${
        data.personal.felonyDescription
          ? `
        <tr>
          <td>Felony Description:</td>
          <td>${data.personal.felonyDescription}</td>
        </tr>
        `
          : ''
      }

      <tr style="background: #eee">
        <td colspan="2"><b>Employment Desired</b></td>
      </tr>
      <tr>
        <td>Position:</td>
        <td>${data.position.desired}</td>
      </tr>
      <tr>
        <td>Date Available:</td>
        <td>${data.position.dateAvailable}</td>
      </tr>
      <tr>
        <td>Salary Desired:</td>
        <td>${data.position.salary}</td>
      </tr>
      <tr>
        <td>Full Time/Part Time:</td>
        <td>${data.position.availability}</td>
      </tr>
      <tr>
        <td>Currently Employed:</td>
        <td>${data.position.currentlyEmployed ? 'Yes' : 'No'}</td>
      </tr>

      <tr style="background: #eee">
        <td colspan="2"><b>Education</b></td>
      </tr>
      ${data.education
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
      ${data.history
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
            <td>${history.title}/td>
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
      ${data.references
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
  `.replaceAll('\n', '')
}
