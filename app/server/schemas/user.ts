import { object, string } from 'yup'

export const userSchema = object().shape({
    firstName: string().required().label('First Name'),
    lastName: string().required().label('Last Name'),
    email: string().email().required().label('Email'),
    phone: string().required().min(14).label('Phone number'),
    address1: string().required().label('Address Line 1'),
    address2: string().label('Address Line 2'),
    city: string().required().label('City'),
    state: string().required().label('State'),
    zip: string().required().min(5).label('Postal code'),
})
