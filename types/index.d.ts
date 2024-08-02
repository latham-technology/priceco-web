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

export type JobsDataEducation = {
    type: null | 'primary' | 'secondary'
    name: string
    location: string
    subjects: string
    complete: null | boolean
}
export type JobsDataHistory = {
    name: string
    location: string
    title: string
    datesEmployed: array
    leaveReason: string
}
export type JobsDataReference = {
    name: string
    yearsKnown: number | null
    address: string
    phone: string
}
export interface JobsFormData {
    [key: string]: any | undefined
    personal: {
        firstName: string
        lastName: string
        email: string
        phone: string
        address1: string
        address2: string
        city: string
        state: string
        zip: string
    }

    position: {
        desired: string
        dateAvailable: string
        availability: null | 'part-time' | 'full-time'
        salary: number | null
        currentlyEmployed: null | boolean
    }

    education: JobsDataEducation[]

    history: JobsDataHistory[]

    references: JobsDataReference[]
}

export interface EmailSavingsFormData {
    [key: string]: any | undefined
    contact: {
        firstName: string
        lastName: string
        email: string
        phone: string
        address1: string
        address2: string
        city: string
        state: string
        zip: string
    }
    survey: {
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
