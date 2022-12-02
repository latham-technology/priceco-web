import type { EmailSavingsFormData } from '~~/types'

export default (data: EmailSavingsFormData) => {
  return `
  <html>
    <body>
      <table rules="all" style="border-color: #666;" cellpadding="10">
        <tr style="background: #eee;">
          <td colspan="2"><b>Customer Information</b></td>
        </tr>
        <tr>
          <td>Name:</td>
          <td>${(
            data.contact.firstName +
            ' ' +
            data.contact.lastName
          ).trim()}</td>
        </tr>
        <tr>
          <td>Email:</td>
          <td><a href="mailto:${data.contact.email}">${
    data.contact.email
  }</a></td>
        </tr>
        <tr>
          <td>Phone:</td>
          <td>
            <a href="tel:${data.contact.phone.replace(/\D/g, '')}">${
    data.contact.phone
  }</a>
          </td>
        </tr>
        <tr>
          <td>Address:</td>
          <td>
            ${data.address.line1}<br />
            ${data.address.line2}
            <br />
            ${data.address.city}, ${data.address.state} ${data.address.zip}
          </td>
        </tr>
        <tr style="background: #eee;">
          <td colspan="2"><b>Demographics</b></td>
        </tr>
        <tr>
          <td>Use Coupons:</td>
          <td>${data.survey.useCoupons ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <td>Aware of the senior discount:</td>
          <td>${data.survey.awareOfSeniorDiscount ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <td>Heard about ESP by:</td>
          <td>${data.survey.referral}</td>
        </tr>
        <tr>
          <td>Comments:</td>
          <td>${data.survey.comments}</td>
        </tr>
      </table>
    </body>
  </html>
  `.replaceAll('\n', '')
}
