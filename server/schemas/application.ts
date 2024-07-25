import { object, string, boolean, array } from 'yup'
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
    salary: string().required().label('Salary Desired'),
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
    complete: boolean().nullable().required().label('Completed'),
})

export const historySchema = object().shape({
    name: string().required().label('Name'),
    title: string().required().label('Title'),
    location: string().required().label('Location'),
    datesEmployed: array()
        .required()
        .nullable()
        .label('Dates Employed'),
    leaveReason: string().required().label('Leave Reason'),
})

export const referenceSchema = object().shape({
    name: string().required().label('Name'),
    yearsKnown: string().required().label('Years Known'),
    phone: string().required().label('Phone'),
    address: string().label('Address'),
})

export default object().shape({
    personal: personalSchema,
    position: positionSchema,
    history: array().of(historySchema),
    education: array().min(1).of(educationSchema),
    references: array().min(3).of(referenceSchema),
})
