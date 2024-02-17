import { object, string, boolean, array } from 'yup'

export const personalSchema = object().shape({
    firstName: string().required(),
    lastName: string().required(),
    email: string().email().required(),
    phone: string().required().min(14),
    address1: string().required(),
    address2: string(),
    city: string().required(),
    state: string().required(),
    zip: string().required().min(5),
})

export const positionSchema = object().shape({
    desired: string().required(),
    dateAvailable: string().required(),
    availability: string().nullable().required(),
    salary: string().required(),
    currentlyEmployed: boolean().nullable().required(),
})

export const educationSchema = object().shape({
    type: string().nullable().required(),
    name: string().required(),
    location: string(),
    subjects: string(),
    complete: boolean().nullable().required(),
})

export const historySchema = object().shape({
    name: string().required(),
    title: string().required(),
    location: string().required(),
    datesEmployed: string().required(),
    leaveReason: string().required(),
})

export const referenceSchema = object().shape({
    name: string().required(),
    yearsKnown: string().required(),
    address: string(),
    phone: string().required(),
})

export default object().shape({
    personal: personalSchema,
    position: positionSchema,
    history: array().of(historySchema),
    education: array().min(1).of(educationSchema),
    references: array().min(3).of(referenceSchema),
})
