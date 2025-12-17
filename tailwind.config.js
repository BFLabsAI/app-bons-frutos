/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#2A3010',
          800: '#454D20',
          700: '#606A30', // Main Logo Color
          600: '#7A8840',
          500: '#8B9650', // Hover
          400: '#A4AF60',
          100: '#EBEED0',
        },
        dark: {
          bg: '#0F120D',    // Deep Forest
          surface: '#1A1E16', // Surface
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
