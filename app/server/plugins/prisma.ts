import { PrismaClient } from '@prisma/client'
import type { JobsFormData } from '~/types'

declare module 'nitropack' {
    interface NitroApp {
        db: {
            client: PrismaClient
            createApplication: (payload: JobsFormData) => void
        }
    }
}

export default defineNitroPlugin((nitroApp) => {
    const prisma = new PrismaClient()

    nitroApp.db = {
        client: prisma,
        createApplication: (payload) => createApplication(payload, prisma),
    }
})

function createApplication(payload: JobsFormData, prisma: PrismaClient) {
    return prisma.application.create({
        data: {
            availability: payload.position.availability,
            currentlyEmployed: payload.position.currentlyEmployed,
            dateAvailable: payload.position.dateAvailable,
            felonyDescription: payload.personal.felonyDescription,
            positionDesired: payload.position.desired,
            salaryDesired: payload.position.salary,
            user: {
                connectOrCreate: {
                    where: {
                        email: payload.personal.email.toLowerCase(),
                    },
                    create: {
                        email: payload.personal.email.toLowerCase(),
                        firstName: payload.personal.firstName,
                        lastName: payload.personal.lastName,
                        address1: payload.personal.address1,
                        address2: payload.personal.address2,
                        phone: payload.personal.phone,
                        city: payload.personal.city,
                        state: payload.personal.state,
                        zip: payload.personal.zip,
                    },
                },
            },
            history: {
                create: payload.history.map((item) => ({
                    companyName: item.name,
                    companyLocation: item.location,
                    positionDates: item.datesEmployed,
                    positionTitle: item.title,
                })),
            },
            education: {
                create: payload.education.map((item) => ({
                    name: item.name,
                    location: item.location,
                    subjects: item.subjects,
                    completed: item.complete,
                    type: item.type,
                })),
            },
            references: {
                create: payload.references.map((item) => ({
                    name: item.name,
                    address: item.address,
                    yearsKnown: item.yearsKnown,
                    phone: item.phone,
                })),
            },
        },
    })
}
