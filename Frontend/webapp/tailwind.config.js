/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
        }
      },
      fontFamily: {
        heading: ['Lexend', 'sans-serif'],
        body: ['Source Sans 3', 'sans-serif'],
      },
    }
  },
  plugins: [],
}