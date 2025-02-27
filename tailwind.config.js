/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'pages/**/*.{js,ts,jsx,tsx}',
    'src/components/**/*.{js,ts,jsx,tsx}',
    'src/layouts/**/*.{js,ts,jsx,tsx}',
    'src/contexts/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        xl: { max: '1300px', min: '993px' },
        sm: { max: '992px' },
      },
      colors: {
        'green-50': 'rgba(29, 244, 154, 0.05)',
        'green-100': 'rgba(0, 249, 155, 0.1)',
        'green-200': 'rgba(29, 244, 154, 0.2)',
        'green-1000': 'rgba(0, 249, 155, 1)',
        'grey-100': 'rgba(255, 243, 240, 0.1)',
        'white-10': 'rgba(255,255,255, 0.01)',
        'white-30': 'rgba(255,255,255, 0.03)',
        'white-40': 'rgba(255,255,255, 0.04)',
        'white-50': 'rgba(255,255,255, 0.05)',
        'white-80': 'rgba(255,255,255, 0.08)',
        'white-100': 'rgba(255,255,255, 0.1)',
        'white-200': 'rgba(255,255,255, 0.2)',
        'white-300': 'rgba(255,255,255, 0.3)',
        'white-500': 'rgba(255,255,255, 0.5)',
        'white-1000': 'rgba(255, 255, 255, 1)',
        'orange-50': 'rgba(229, 137, 71, 0.05)',
        'orange-200': 'rgba(229, 137, 71, 0.2)',
        orange: '#E58947',
        'orange-second': '#F46F51',
        red: '#F14444',
        'dark-red': '#FB3D3D',
        'blood-red': 'rgba(251, 61, 61, 0.09)',
        'light-green': '#1DF49A',
        'red-100': 'rgba(251, 61, 61, 0.1)',
        'red-1000': 'rgba(251, 61, 61, 1)',
        'dark-grey-100': 'rgba(13, 14, 15, 0.10)',
        'black-100': 'rgba(0, 0, 0, 1)',
        'black-1000': 'rgba(8, 8, 8, 1)',
        black: '#000000',
      },
    },
  },
  plugins: [],
};