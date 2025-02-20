import type { MenuNavigationItem } from '@/types'

export const useMenu = () => {
    return useState<MenuNavigationItem[]>('navigation-items', () => [
        {
            text: 'Home',
            to: '/',
        },
        {
            text: 'Weekly Specials',
            to: '/ad',
        },
        {
            text: 'Departments',
            children: [
                {
                    text: 'Grocery',
                    to: '/departments/grocery',
                },
                {
                    text: 'Produce',
                    to: '/departments/produce',
                },
                {
                    text: 'Meat',
                    to: '/departments/meat',
                },
                {
                    text: 'Seafood',
                    to: '/departments/seafood',
                },
                {
                    text: 'Bakery',
                    to: '/departments/bakery',
                },
                {
                    text: 'Deli',
                    to: '/departments/deli',
                },
                {
                    text: 'Floral',
                    to: '/departments/floral',
                },
            ],
        },
        {
            text: 'Savings',
            children: [
                {
                    text: 'Email Savings',
                    to: '/savings/emailsavings',
                },
                {
                    text: 'Price Comparison',
                    to: '/savings/price-comparison',
                },
                {
                    text: 'Scrip Program',
                    to: '/savings/scrip',
                },
            ],
        },
        {
            text: 'About Us',
            to: '/about',
        },
        {
            text: 'Virtual Tour',
            to: '/tour',
        },
    ])
}
