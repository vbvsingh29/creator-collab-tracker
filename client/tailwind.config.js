/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0a0a0c',
          900: '#121215',
          850: '#16161a',
          800: '#1c1c22',
          700: '#282830',
          600: '#3a3a46',
        },
        sand: {
          50: '#fbfaf7',
          100: '#f5f2eb',
          200: '#e8e2d5',
          300: '#d9c7b2',
          400: '#c5a880',
          500: '#b39264',
          600: '#967448',
        },
        instagram: {
          pink: '#E1306C',
          purple: '#833AB4',
          orange: '#F77737',
        },
        youtube: {
          red: '#FF0000',
          dark: '#282828',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
