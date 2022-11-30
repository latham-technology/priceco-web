export type SurveyShoppedStores =
  | 'PriceCo Foods'
  | 'Safeway'
  | 'Savemart'
  | 'Cost-U-Less'

export interface SurveyFormData {
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
