import { object, string } from 'yup'
import { userSchema } from './user'

export default object().shape({
    contact: userSchema,
    survey: object().shape({
        useCoupons: string().nullable(),
        awareOfSeniorDiscount: string().nullable(),
        referral: string().nullable(),
        comments: string().nullable(),
    }),
})
