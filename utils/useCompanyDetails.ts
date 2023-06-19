import FacebookIcon from '@/assets/img/facebook.svg?raw'
import InstagramIcon from '@/assets/img/instagram.svg?raw'

type CompanyDetails = {
  googleMapsUrl: string

  address: {
    street: string
    city: string
    state: string
    zip: string
  }

  phone: string

  hours: {
    key: string
    value: string
  }[]

  socialNetworks: {
    name: string
    url: string
    color: string
    icon: Element
  }[]
}

export const useCompanyDetails = () =>
  useState<CompanyDetails>('companyDetails', () => ({
    googleMapsUrl: 'https://goo.gl/maps/yznsfXefHP6ayLDX9',

    address: {
      street: '13765 Mono Way',
      city: 'Sonora',
      state: 'CA',
      zip: '95370',
    },
    phone: '(209) 532-4343',

    hours: [
      {
        key: 'Monday - Saturday',
        value: '7:00am - 9:00pm',
      },
      {
        key: 'Sunday',
        value: '8:00am - 8:00pm',
      },
    ],

    socialNetworks: [
      {
        name: 'Facebook',
        icon: FacebookIcon,
        url: 'https://www.facebook.com/priceco.foods',
        color: '#3b5998',
      },
      {
        name: 'Instagram',
        icon: InstagramIcon,
        url: 'https://www.instagram.com/priceco_foods',
        color: '#8a3ab9',
      },
    ],
  }))
