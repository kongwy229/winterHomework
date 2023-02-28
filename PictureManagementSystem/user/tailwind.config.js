// tailwind.config.js
module.exports = {
  purge: [
    './public/**/*.html',
    './src/**/*.vue',
    './src/**/*.jsx'
  ],
  mode: 'jit', // 加上之后可以使用px
  darkMode: false, // or 'media' or 'class'
  theme: {
    boxShadow: {
      DEFAULT: '0px 4px 10px rgba(81, 81, 82, 0.9)'
    },
    fontSize: {
      base: '12px',
      lg: '14px',
      xl: '16px',
      '2xl': '18px',
      '3xl': '22px'
    },
    extend: {
      height: {
        md: '62px',
        lg: '110px'
      },
      colors: {
        primary: {
          500: '#4FB5F9',
          600: '#38ABF8'
        },
        warn:{
          500: '#FFA500'
        },
        gray: {
          200: 'rgba(244, 244, 244, 0.68)',
          300: '#F0F0F0',
          400: '#F0F1F5',
          500: '#C6C5C5',
          600: '#C3C3C3',
          700: 'rgba(51, 51, 51, 0.74)',
          900: '#333333',
          1000: '#1F2233'
        }
      }
    }
  },
  variants: {},
  plugins: []
}
