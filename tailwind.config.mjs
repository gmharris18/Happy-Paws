/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f5fbff",
          100: "#e0f4ff",
          200: "#b3e3ff",
          300: "#80cfff",
          400: "#4dbbff",
          500: "#199dff",
          600: "#0077d6",
          700: "#0059a3",
          800: "#003f73",
          900: "#002543"
        },
        accent: {
          100: "#ffe5d9",
          200: "#ffc9c9",
          300: "#ffb3b3"
        }
      }
    }
  },
  plugins: []
};


