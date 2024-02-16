import { object, string, boolean, array } from 'yup'

export const personalSchema = object().shape({
    firstName: string().required(),
    lastName: string().required(),
    email: string().email().required(),
    phone: string().required(),
    address1: string().required(),
    address2: string().required(),
    city: string().required(),
    state: string().required(),
    zip: string().required(),
    felony: string().nullable(),
    felonyDescription: string().optional(),
})

export const positionSchema = object().shape({
    desired: string().required(),
    dateAvailable: string().required(),
    availability: string().nullable(),
    salary: string().required(),
    currentlyEmployed: boolean().nullable().required(),
})

export const educationSchema = object().shape({
    type: string().nullable(),
    name: string().required(),
    location: string().required(),
    subjects: string().required(),
    complete: boolean().nullable().required(),
})

export const historySchema = object().shape({
    name: string().required(),
    location: string().required(),
    title: string().required(),
    datesEmployed: string().required(),
    leaveReason: string().required(),
})

export default object().shape({
    personal: personalSchema,
    history: historySchema,
})
