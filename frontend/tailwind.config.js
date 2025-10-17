/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        shelter: {
          green: '#10b981',
          orange: '#f59e0b',
          red: '#ef4444',
          gray: '#6b7280',
        }
      }
    },
  },
  plugins: [],
}

