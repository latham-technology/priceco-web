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
    address1: string()
        .required('Address 1 is required')
        .label('Address Line 1'),
    address2: string().label('Address Line 2'),
    city: string().required('City is required').label('City'),
    state: string()
        .oneOf(
            new UsaStates().arrayOf('abbreviations'),
            'Not a valid state abbreviation',
        )
        .required('State is required')
        .label('State'),
    zip: string().required().min(5).label('Postal code'),
})
