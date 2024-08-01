import { string, boolean, number, object, array } from 'yup'

type ShoppedStores =
    | 'PriceCo Foods'
    | 'Safeway'
    | 'Savemart'
    | 'Cost-U-Less'
    | 'Walmart'

export interface FeedbackInput {
    [key: string]: any | undefined
    name: string
    email?: string
    phone?: string
    contactMethod: null | 'email' | 'phone'
    shoppedStores: ShoppedStores[]
    onlineOrdering: boolean | null
    usesCoupons: boolean | null
    awareSeniorDiscount: boolean | null
    triedRecipes: boolean | null
    comments: string
    rating: {
        [key: string]: number
        deli: number
        meat: number
        seafood: number
        bakery: number
        dairy: number
        produce: number
        frozen: number
        floral: number
        staff: number
        checkout: number
    }
}

export default object().shape(
    {
        name: string().required('Name is required'),
        email: string()
            .email()
            .when('phone', {
                is: '',
                then: string().required('Email or phone is required'),
                otherwise: string(),
            }),
        phone: string().when('email', {
            is: '',
            then: string().required('Email or phone is required'),
            otherwise: string(),
        }),
        contactMethod: string()
            .nullable()
            .required('Contact method is required'),
        shoppedStores: array().nullable(),
        onlineOrdering: boolean().nullable(),
        usesCoupons: boolean().nullable(),
        awareSeniorDiscount: boolean().nullable(),
        triedRecipes: boolean().nullable(),
        comments: string().nullable(),
        rating: object().shape({
            deli: number().nullable(),
            meat: number().nullable(),
            seafood: number().nullable(),
            bakery: number().nullable(),
            dairy: number().nullable(),
            produce: number().nullable(),
            frozen: number().nullable(),
            floral: number().nullable(),
            staff: number().nullable(),
            checkout: number().nullable(),
        }),
    },
    ['phone', 'email'],
)
