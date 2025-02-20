import { PrismaClient } from '@prisma/client'
import dayjs from 'dayjs'
import type { FeedbackInput } from '../schemas/feedback'
import type { AdminUserInput } from '../schemas/adminUser'
import { useConstants } from '~/composables/useConstants'
import type { ApplicationFormInput, LoyaltyInput } from '@/types'

declare module 'nitropack' {
    interface NitroApp {
        $db: {
            client: ReturnType<typeof extendedPrismaClient>
            createApplication: (payload: ApplicationFormInput) => void
            createLoyalty: (payload: LoyaltyInput) => void
            createFeedback: (
                payload: FeedbackInput,
            ) => ReturnType<typeof createFeedbackWithPrisma>
            createAdminUser: (
                payload: AdminUserInput,
            ) => ReturnType<typeof createAdminUserWithPrisma>
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
        createFeedback: (payload) =>
            createFeedbackWithPrisma(payload, prisma),
        createAdminUser: (payload) =>
            createAdminUserWithPrisma(payload, prisma),
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

            application: {
                dateAvailableFormatted: {
                    needs: { dateAvailable: true },
                    compute({ dateAvailable }) {
                        return dayjs(dateAvailable).format(
                            'MM/DD/YYYY',
                        )
                    },
                },

                read: {
                    needs: { log: true },
                    compute({ log }) {
                        return !!log.find(
                            (entry) => entry.action === 'VIEW',
                        )
                    },
                },
            },

            applicationHistory: {
                positionDatesFormatted: {
                    needs: { positionDates: true },
                    compute({ positionDates }) {
                        return positionDates?.map((date) =>
                            dayjs(date).format('MM/DD/YYYY'),
                        )
                    },
                },
            },
        },
    })

    return extendedPrismaClient
}

function createApplicationWithPrisma(
    payload: ApplicationFormInput,
    prisma: ReturnType<typeof extendedPrismaClient>,
) {
    return prisma.application.create({
        data: {
            availability: payload.availability,
            currentlyEmployed: payload.currentlyEmployed,
            dateAvailable: payload.dateAvailable,
            positionDesired: payload.positionDesired,
            salaryDesired: payload.salaryDesired,
            user: {
                connectOrCreate: {
                    where: {
                        email: payload.user.email.toLowerCase(),
                    },
                    create: {
                        ...payload.user,
                        email: payload.user.email.toLowerCase(),
                    },
                },
            },
            history: {
                create: payload.history,
            },
            education: {
                create: payload.education,
            },
            references: {
                create: payload.references,
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
    payload: LoyaltyInput,
    prisma: ReturnType<typeof extendedPrismaClient>,
) {
    const user = await prisma.user.findUnique({
        where: {
            email: payload.user.email.toLowerCase(),
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
                        email: payload.user.email.toLowerCase(),
                    },
                    create: {
                        ...payload.user,
                        email: payload.user.email.toLowerCase(),
                    },
                },
            },
            surveyJson: payload.surveyJson,
        },
        include: {
            user: true,
        },
    })
}

function createFeedbackWithPrisma(
    payload: FeedbackInput,
    prisma: ReturnType<typeof extendedPrismaClient>,
) {
    return prisma.feedback.create({
        data: {
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            contactMethod: payload.contactMethod,
            shopsPriceco:
                payload.shoppedStores.includes('PriceCo Foods'),
            shopsSafeway: payload.shoppedStores.includes('Safeway'),
            shopsSavemart: payload.shoppedStores.includes('Savemart'),
            shopsCostuless:
                payload.shoppedStores.includes('Cost-U-Less'),
            shopsWalmart: payload.shoppedStores.includes('Walmart'),
            onlineOrdering: payload.onlineOrdering,
            usesCoupons: payload.usesCoupons,
            awareSeniorDiscount: payload.awareSeniorDiscount,
            triedRecipes: payload.triedRecipes,
            ratingDeli: payload.rating.deli,
            ratingMeat: payload.rating.meat,
            ratingSeafood: payload.rating.seafood,
            ratingBakery: payload.rating.bakery,
            ratingDairy: payload.rating.dairy,
            ratingProduce: payload.rating.produce,
            ratingFrozen: payload.rating.frozen,
            ratingFloral: payload.rating.floral,
            ratingStaff: payload.rating.staff,
            ratingCheckout: payload.rating.checkout,
            comments: payload.comments,
        },
    })
}

async function createAdminUserWithPrisma(
    payload: AdminUserInput,
    prisma: ReturnType<typeof extendedPrismaClient>,
) {
    return prisma.adminUser.create({
        data: {
            email: payload.email,
            password: await hash(payload.password),
        },
    })
}
