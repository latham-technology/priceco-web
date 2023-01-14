import FacebookIcon from '@/assets/img/facebook.svg?raw'
import InstagramIcon from '@/assets/img/instagram.svg?raw'

export const useCompanyDetails = () =>
  useState('companyDetails', () => ({
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
        value: '8:00am - 9:00pm',
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
