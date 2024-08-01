import { object, string, boolean, array, number } from 'yup'
import { userSchema } from './user'

export const personalSchema = userSchema

export const positionSchema = object().shape({
    desired: string().required().label('Desired Position'),
    dateAvailable: string()
        .required()
        .nullable()
        .label('Date Available'),
    availability: string()
        .nullable()
        .required()
        .label('Availability'),
    salary: number().required('Salary is required').nullable(),
    currentlyEmployed: boolean()
        .nullable()
        .required()
        .label('Currently Employed'),
})

export const educationSchema = object().shape({
    type: string().nullable().required().label('Type'),
    name: string().required().label('Name'),
    location: string().label('Location'),
    subjects: string().label('Subjects'),
    complete: boolean().nullable().required('Completed is required'),
})

export const historySchema = object().shape({
    name: string().required('Name is required'),
    title: string().required('Title is required'),
    location: string().required('Location is required'),
    datesEmployed: array()
        .required('Dates employed is required')
        .nullable(),
    leaveReason: string().required('Leave reason is required'),
})

export const referenceSchema = object().shape({
    name: string().required('Name is required'),
    yearsKnown: number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .nullable()
        .required('Years known is required'),
    phone: string().required('Phone number is required'),
    address: string(),
})

export default object().shape({
    personal: personalSchema,
    position: positionSchema,
    history: array().of(historySchema),
    education: array().min(1).of(educationSchema),
    references: array().min(3).of(referenceSchema),
})
