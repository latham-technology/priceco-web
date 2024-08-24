import { object, string, boolean, array, number } from 'yup'
import { userSchema } from './user'
import { phoneSchema } from './helpers'

export const educationSchema = object().shape({
    type: string().nullable().required().label('Type'),
    name: string().required().label('Name'),
    location: string().label('Location'),
    subjects: string().label('Subjects'),
    completed: boolean().nullable().required('Completed is required'),
})

export const historySchema = object().shape({
    companyName: string().required('Name is required'),
    positionTitle: string().required('Title is required'),
    companyLocation: string().required('Location is required'),
    positionDates: array()
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
    phone: phoneSchema,
    address: string(),
})

export default object().shape({
    user: userSchema,
    positionDesired: string().required('Position is required'),
    dateAvailable: string()
        .required('Date available is required')
        .nullable(),
    availability: string()
        .nullable()
        .required('Availability is required'),
    salaryDesired: number()
        .required('Salary desired is required')
        .nullable(),
    currentlyEmployed: boolean()
        .nullable()
        .required('Currently employed is required'),
    history: array().of(historySchema),
    education: array().min(1).of(educationSchema),
    references: array().min(3).of(referenceSchema),
})
