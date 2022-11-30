import { SurveyFormData } from '~~/types'

export default (data: SurveyFormData) => {
  return `
  <html>
    <body>
      <table rules="all" style="border-color: #666;" cellpadding="10">
        <tr style="background: #eee;">
          <td colspan="2"><b>Customer Information</b></td>
        </tr>
        <tr>
          <td>Name:</td>
          <td>${data.contact.name}</td>
        </tr>
        <tr>
          <td>Email:</td>
          <td>${data.contact.email}</td>
        </tr>
        <tr>
          <td>Phone:</td>
          <td>${data.contact.phone}</td>
        </tr>
        <tr>
          <td>Prefered Contact:</td>
          <td>${data.contact.preferredContactMethod}</td>
        </tr>
        <tr style="background: #eee;">
          <td colspan="2"><b>Demographics</b></td>
        </tr>
        <tr>
          <td>Shops At:</td>
          <td>
            ${
              data.survey.shoppedStores.length
                ? data.survey.shoppedStores.join(', ')
                : 'None Selected'
            }
          </td>
        </tr>
        <tr>
          <td>Would Order Online:</td>
          <td>${data.survey.wouldOrderOnline ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <td>Uses Coupons:</td>
          <td>${data.survey.useCoupons ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <td>Aware of the senior discount:</td>
          <td>${data.survey.awareOfSeniorDiscount ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <td>Tried recipe suggestions:</td>
          <td>${data.survey.hasTriedRecipeSuggestions ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <td>Comments:</td>
          <td>${data.comments}</td>
        </tr>
        <tr style="background: #eee;">
          <td colspan="2"><b>Survey</b>
          <br />
          5 = Great. 1 = Bad. 0 = No Answer.</td>
        </tr>
  
        ${Object.keys(data.ratings)
          .map(
            (key) => `
            <tr>
              <td>${key.charAt(0).toUpperCase()}${key.slice(1)}:</td>
              <td>${data.ratings[key] === null ? 0 : data.ratings[key]}</td>
            </tr>
          `
          )
          .join('')}
      </table>
    </body>
  </html>
  `.replaceAll('\n', '')
}
