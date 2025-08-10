/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // or 'media' for automatic based on system settings
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,svelte,vue}'],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-in-out',
      },
    },
  },
  plugins: [],
};
