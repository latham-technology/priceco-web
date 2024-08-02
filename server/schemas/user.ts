import { object, string } from 'yup'
import { UsaStates } from 'usa-states'

export const userSchema = object().shape({
    firstName: string().required('First name is required'),
    lastName: string().required('Last name is required'),
    email: string()
        .email('Must be a valid email address')
        .required('Email address is required'),
    phone: string()
        .required('Phone number is required')
        .min(14, 'Must be a valid phone number'),
    address1: string().required('Address 1 is required'),
    address2: string(),
    city: string().required('City is required'),
    state: string()
        .oneOf(
            new UsaStates().arrayOf('abbreviations'),
            'Not a valid state abbreviation',
        )
        .required('State is required'),
    zip: string()
        .required('Zip code is required')
        .nullable()
        .min(5, 'Must be at least 5 digits'),
})
