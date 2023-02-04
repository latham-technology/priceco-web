export type SurveyShoppedStores =
  | 'PriceCo Foods'
  | 'Safeway'
  | 'Savemart'
  | 'Cost-U-Less'

export interface SurveyFormData {
  [key: string]: any | undefined
  contact: {
    name: string
    email: string
    phone: string
    preferredContactMethod: null | 'email' | 'phone'
  }
  survey: {
    shoppedStores: SurveyShoppedStores[]
    wouldOrderOnline: boolean | null
    useCoupons: boolean | null
    awareOfSeniorDiscount: boolean | null
    hasTriedRecipeSuggestions: boolean | null
  }
  ratings: {
    [key: string]: null | number
    deli: null | number
    meat: null | number
    seafood: null | number
    bakery: null | number
    dairy: null | number
    produce: null | number
    frozen: null | number
    floral: null | number
    staff: null | number
    checkout: null | number
  }
  comments: string
}

export type JobsDataEducation = {
  type: null | 'primary' | 'secondary'
  name: string
  location: string
  subjects: string
  complete: null | boolean
  _key?: string
  _removable?: boolean
}
export type JobsDataHistory = {
  name: string
  location: string
  title: string
  datesEmployed: string
  leaveReason: string
  _key?: string
  _removable?: boolean
}
export type JobsDataReference = {
  name: string
  yearsKnown: string
  address: string
  phone: string
  _key?: string
  _removable?: boolean
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
    felony: null | boolean
    felonyDescription?: string
  }

  position: {
    desired: string
    dateAvailable: string
    availability: null | 'part-time' | 'full-time'
    salary: string
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
  }
  address: {
    line1: string
    line2: string
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
    brand: string
    description: string
    size: string
    lastPurchased: string
    additionalInformation: string
  }
}

export interface MenuNavigationItem {
  text: string
  to?: string
  children?: NavigationItem[]
}
