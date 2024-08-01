import { object, string } from 'yup'

export type AdminUserInput = {
    email: string
    password: string
}

export const adminUserSchema = object().shape({
    email: string()
        .email('Must be a valid email address')
        .required('Email is required'),
    password: string().required('Password is required'),
})
