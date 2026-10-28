/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/views/**/*.blade.php",
    "./resources/js/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#f7f8f3',
          100: '#eef0e8',
          200: '#dfe3d8',
          300: '#c9d0c1',
          400: '#909b88',
          500: '#687361',
          600: '#535f4d',
          700: '#414d3c',
          800: '#303b2c',
          900: '#212a1e',
        },
        brand: {
          50: '#eff5ed',
          100: '#deead9',
          200: '#c1d7b9',
          300: '#9dbb94',
          400: '#7a9e71',
          500: '#5e8255',
          600: '#496a43',
          700: '#395636',
          800: '#2b4530',
          900: '#213827',
        },
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};
