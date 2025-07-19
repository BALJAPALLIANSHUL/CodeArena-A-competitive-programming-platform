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
        primary: {
          DEFAULT: '#007bff',
          dark: '#0056b3',
          light: '#339dff',
        },
        secondary: {
          DEFAULT: '#28a745',
          dark: '#1e7e34',
          light: '#5cd17b',
          darker: '#218838',
        },
        accent1: {
          DEFAULT: '#ffc107',
          dark: '#e0a800',
          light: '#ffe082',
          darker: '#ffb300',
        },
        accent2: '#ffffff',
        textColor: {
          DEFAULT: '#343a40',
          dark: '#f8f9fa',
        },
        bgColor: {
          DEFAULT: '#f8f9fa',
          dark: '#1a1a1a',
        },
        darkBg: '#1a1a1a',
        darkText: '#f8f9fa',
        'light-border': '#e0e0e0',
        'input-border': '#ced4da',
        'placeholder-color': '#adb5bd',
        // Additional for dark mode borders/inputs
        'form-dark': '#2c2c2c',
        'input-dark': '#3c3c3c',
        'border-dark': '#505050',
        'placeholder-dark': '#a0a0a0',
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        condensed: ['Roboto Condensed', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      cursor: {
        default: 'default',
        pointer: 'pointer',
        text: 'text',
        interactive: 'pointer',
        code: 'text',
      },
    },
  },
  plugins: [],
}; 