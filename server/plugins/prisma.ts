import { PrismaClient } from '@prisma/client'
import { useConstants } from '~/composables/useConstants'
import type { JobsFormData, EmailSavingsFormData } from '~/types'

declare module 'nitropack' {
    interface NitroApp {
        $db: {
            client: ReturnType<typeof extendedPrismaClient>
            createApplication: (payload: JobsFormData) => void
            createLoyalty: (payload: EmailSavingsFormData) => void
        }
    }
}

export default defineNitroPlugin((nitroApp) => {
    const prisma = extendedPrismaClient()

    nitroApp.$db = {
        client: prisma,
        createApplication: (payload) =>
            createApplicationWithPrisma(payload, prisma),
        createLoyalty: (payload) =>
            createLoyaltyWithPrisma(payload, prisma),
    }
})

function extendedPrismaClient() {
    const prisma = new PrismaClient()

    const extendedPrismaClient = prisma.$extends({
        result: {
            user: {
                fullName: {
                    needs: { firstName: true, lastName: true },
                    compute(user) {
                        return `${user.firstName} ${user.lastName}`
                    },
                },
            },
        },
    })

    return extendedPrismaClient
}

function createApplicationWithPrisma(
    payload: JobsFormData,
    prisma: ReturnType<typeof extendedPrismaClient>,
) {
    return prisma.application.create({
        data: {
            availability: payload.position.availability,
            currentlyEmployed: payload.position.currentlyEmployed,
            dateAvailable: payload.position.dateAvailable,
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
        include: {
            education: true,
            history: true,
            references: true,
            user: true,
        },
    })
}

async function createLoyaltyWithPrisma(
    payload: EmailSavingsFormData,
    prisma: ReturnType<typeof extendedPrismaClient>,
) {
    const user = await prisma.user.findUnique({
        where: {
            email: payload.contact.email.toLowerCase(),
        },
        include: {
            loyalty: true,
        },
    })

    if (user?.loyalty.length) {
        throw new Error(useConstants().API_LOYALTY_MAX_PER_USER)
    }

    return prisma.loyalty.create({
        data: {
            user: {
                connectOrCreate: {
                    where: {
                        email: payload.contact.email.toLowerCase(),
                    },
                    create: {
                        email: payload.contact.email.toLowerCase(),
                        firstName: payload.contact.firstName,
                        lastName: payload.contact.lastName,
                        address1: payload.contact.address1,
                        address2: payload.contact.address2,
                        phone: payload.contact.phone,
                        city: payload.contact.city,
                        state: payload.contact.state,
                        zip: payload.contact.zip,
                    },
                },
            },
            surveyJson: JSON.stringify(payload.survey),
        },
        include: {
            user: true,
        },
    })
}
