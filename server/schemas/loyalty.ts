import { boolean, object, string } from 'yup'
import { userSchema } from './user'

export default object().shape({
    user: userSchema,
    surveyJson: object().shape({
        useCoupons: boolean().nullable(),
        awareOfSeniorDiscount: string().nullable(),
        referral: string().nullable(),
        comments: string().nullable(),
    }),
})
