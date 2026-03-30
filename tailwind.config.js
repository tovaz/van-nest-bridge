/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/views/**/*.hbs",
    "./src/modules/admin/views/*.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#880063',
        highlight: '#2b537c',
        secondary: '#984283',
        tertiary: '#d09bc4',
        accent: '#99989b',
        background: '#d0d0dc',
        text: '#1e0117',
        light: '#ffffff',
        buttonPressed: '#CA4D6E',
        disable: '#b3b3c7',
        success: '#006322',
        danger: '#c9454b',
      },
      fontFamily: {
        sans: ['Roboto', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
