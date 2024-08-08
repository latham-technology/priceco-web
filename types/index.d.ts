declare module 'nuxt/schema' {
    interface RuntimeConfig {
        turnstile: {
            secretKey: string
        }
        mailgun: {
            apiKey: string
        }
    }
    interface PublicRuntimeConfig {
        environment: 'production' | 'development'
        baseUrl: string
        mailgun: {
            domain: string
            mailTo: string
            sender: string
        }
        bugsnag: {
            apiKey: string
        }
        plausible: {
            apiHost: string
            domain: string
        }
        strapi: {
            url: string
        }
        turnstile: {
            siteKey: string
        }
    }
}
// It is always important to ensure you import/export something when augmenting a type
export {}

export type UserInput = {
    email: string
    phone: string
    firstName: string
    lastName: string
    address1: string
    address2: string
    city: string
    state: string
    zip: string
}

export type ApplicationEducationInput = {
    type: 'primary' | 'secondary'
    name: string
    location: string
    subjects: string
    completed: boolean
}
export type ApplicationHistoryInput = {
    companyName: string
    companyLocation: string
    positionTitle: string
    positionDates: array
    leaveReason: string
}
export type ApplicationReferenceInput = {
    name: string
    yearsKnown: number
    address: string
    phone: string
}
export interface ApplicationFormInput {
    [key: string]: any | undefined
    user: UserInput
    positionDesired: string
    dateAvailable: string
    availability: 'part-time' | 'full-time'
    salaryDesired: number
    currentlyEmployed: boolean
    education: ApplicationEducationInput[]
    history: ApplicationHistoryInput[]
    references: ApplicationReferenceInput[]
}

export interface LoyaltyInput {
    user: UserInput
    surveyJson: {
        useCoupons: boolean | null
        awareOfSeniorDiscount: boolean | null
        referral: null | 'other' | 'friend' | 'website' | 'flyer'
        comments: string
    }
}

export interface NewItemFormData {
    [key: string]: any | undefined
    contact: {
        name: string
        phone: string
    }
    item: {
        additionalInformation: string
        brand: string
        description: string
        lastPurchased: string
        size: string
    }
}

export interface MenuNavigationItem {
    text: string
    to?: string
    href?: string
    children?: NavigationItem[]
    target?: string
}
