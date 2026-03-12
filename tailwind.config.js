/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base:        '#0A1220',
        surface:     '#101C2E',
        'surface-2': '#162438',
        orange:      '#C8562A',
        'orange-glow': '#D8623A',
        amber:       '#C4982A',
        'text-primary': '#C0C2C9',
        'text-muted':   '#606470',
        border:      '#1E3350',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'orange-glow': '0 0 20px rgba(212, 88, 10, 0.25)',
        'amber-glow':  '0 0 20px rgba(201, 162, 39, 0.2)',
        'card': '0 2px 12px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
