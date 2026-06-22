/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5D3754',
          hover: '#4C2C44',
          light: '#724B6A',
          bg: '#FAF6F2',
        },
        secondary: {
          DEFAULT: '#F4DFD7',
          light: '#F8ECE8',
        },
        tertiary: {
          DEFAULT: '#8FA998',
          light: '#A5BEAE',
          dark: '#586E5E',
        },
        neutral: {
          DEFAULT: '#FDFBFA',
          dark: '#2A1A24',
        }
      },
      fontFamily: {
        serif: ['"EB Garamond"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
