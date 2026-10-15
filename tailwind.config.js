/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0d14',
          panel: '#0f1422',
          border: '#1e293b',
          accent: '#00f0ff',
          neonPink: '#ff007f',
          neonGreen: '#00ff66',
          neonAmber: '#ffaa00',
          neonPurple: '#a855f7'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
