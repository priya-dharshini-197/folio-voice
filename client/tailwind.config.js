/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050811', // Deep base background
          900: '#0a0f1d', // Primary surface
          850: '#0c1427', // Card surface
          800: '#111b33', // Lighter surface
          700: '#1e293b', // Borders & dividers
        },
        ice: {
          300: '#7dd3fc',
          400: '#38bdf8', // Signature ice-blue accent
          500: '#0ea5e9',
          600: '#0284c7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'aurora-slow': 'aurora 25s ease infinite alternate',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
      },
      keyframes: {
        aurora: {
          '0%': { transform: 'translate(0%, 0%) scale(1)' },
          '50%': { transform: 'translate(10%, -10%) scale(1.1)' },
          '100%': { transform: 'translate(-5%, 5%) scale(0.95)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.8 },
        }
      }
    },
  },
  plugins: [],
}
