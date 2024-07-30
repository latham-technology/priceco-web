/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client')
const crypto = require('uncrypto')
const { faker } = require('@faker-js/faker')

const prisma = new PrismaClient()

async function main() {
    const adminUser = {
        email: 'admin@test.com',
        password: 'letmein',
    }

    await Promise.all([
        prisma.adminUser.upsert({
            where: { email: 'admin@test.com' },
            update: {},
            create: {
                email: adminUser.email,
                password: await hash(adminUser.password),
            },
        }),
        createApplications(100),
        createLoyalty(50),
    ])

    console.log('Created admin user:', adminUser)
}

async function hash(str) {
    const msgUint8 = new TextEncoder().encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-512', msgUint8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    return hashHex
}

async function createApplications(count = 1) {
    const createUser = () => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        address1: faker.location.streetAddress(),
        address2: faker.location.secondaryAddress(),
        city: faker.location.city(),
        state: faker.location.state({
            abbreviated: true,
        }),
        zip: faker.location.zipCode(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
    })

    const createHistory = () => ({
        companyName: faker.company.name(),
        companyLocation: faker.location.streetAddress({
            useFullAddress: true,
        }),
        positionDates: [
            faker.date.anytime().toISOString(),
            faker.date.anytime().toISOString(),
        ],
        positionTitle: faker.person.jobTitle(),
    })

    const createEducation = () => ({
        location: faker.location.streetAddress({
            useFullAddress: true,
        }),
        name: faker.company.name(),
        subjects: faker.lorem.words({
            min: 2,
            max: 5,
        }),
        completed: faker.datatype.boolean(),
        type: faker.helpers.arrayElement(['primary', 'secondary']),
    })

    const createReference = () => ({
        address: faker.location.streetAddress({
            useFullAddress: true,
        }),
        name: faker.person.fullName(),
        phone: faker.phone.number(),
        yearsKnown: faker.number.int({
            min: 1,
            max: 20,
        }),
    })

    return await Promise.all(
        Array.from(Array(count)).map(() => {
            const user = createUser()

            return prisma.application.create({
                data: {
                    availability: faker.helpers.arrayElement([
                        'full-time',
                        'part-time',
                    ]),
                    currentlyEmployed: faker.datatype.boolean(),
                    dateAvailable: faker.date.future().toISOString(),
                    positionDesired: faker.person.jobTitle(),
                    salaryDesired: faker.number.float({
                        min: 10,
                        max: 100,
                        fractionDigits: 2,
                    }),
                    history: {
                        create: Array.from(
                            Array(
                                faker.number.int({
                                    min: 0,
                                    max: 8,
                                }),
                            ),
                        ).map(createHistory),
                    },
                    education: {
                        create: Array.from(
                            Array(
                                faker.number.int({
                                    min: 1,
                                    max: 3,
                                }),
                            ),
                        ).map(createEducation),
                    },
                    references: {
                        create: Array.from(
                            Array(
                                faker.number.int({
                                    min: 1,
                                    max: 3,
                                }),
                            ),
                        ).map(createReference),
                    },
                    user: {
                        connectOrCreate: {
                            where: {
                                email: user.email,
                            },
                            create: user,
                        },
                    },
                },
            })
        }),
    )
}

async function createLoyalty(count = 1) {
    const createUser = () => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        address1: faker.location.streetAddress(),
        address2: faker.location.secondaryAddress(),
        city: faker.location.city(),
        state: faker.location.state({
            abbreviated: true,
        }),
        zip: faker.location.zipCode(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
    })

    return await Promise.all(
        Array.from(Array(count)).map(() => {
            const user = createUser()

            return prisma.loyalty.create({
                data: {
                    surveyJson: JSON.stringify({
                        useCoupons: faker.helpers.arrayElement([
                            true,
                            false,
                        ]),
                        awareOfSeniorDiscount:
                            faker.helpers.arrayElement([true, false]),
                        referral: faker.helpers.arrayElement([
                            'other',
                            'friend',
                            'website',
                            'flyer',
                            null,
                        ]),
                        comments: faker.helpers.arrayElement([
                            null,
                            faker.lorem.paragraph(),
                        ]),
                    }),
                    user: {
                        connectOrCreate: {
                            where: {
                                email: user.email,
                            },
                            create: user,
                        },
                    },
                },
            })
        }),
    )
}

main()
    .then(async () => await prisma.$disconnect())
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
