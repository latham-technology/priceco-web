import { object, string, boolean, array } from 'yup'

export const personalSchema = object().shape({
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

export const positionSchema = object().shape({
    desired: string().required().label('Desired Position'),
    dateAvailable: string().required().label('Date Available'),
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
    datesEmployed: string().required().label('Dates Employed'),
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
