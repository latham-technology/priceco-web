import { string } from 'yup'

export const phoneSchema = string()
    .required('Phone number is required')
    .test(
        'is-10-digits',
        'Phone number must be 10 digits',
        (value) => value?.replace(/\D/g, '').length === 10,
    )

export const emailSchema = string()
    .email('Must be a valid email address')
    .required('Email address is required')
