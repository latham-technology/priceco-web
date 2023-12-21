import Color from 'color'

const brandBlue = Color('#4e80a7')

export default {
  theme: {
    fontFamily: {
      sans: 'Droid Sans',
      serif: 'Droid Serif',
    },

    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '600px',
        md: '728px',
        lg: '960px',
      },
    },

    extend: {
      colors: {
        brand: {
          blue: {
            DEFAULT: brandBlue.hex().toString(),
            lighter: brandBlue.lighten(0.5).hex().toString(),
            darker: brandBlue.darken(0.5).hex().toString(),
          },
        },
      },
    },
  },
}
