/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: '#05070d',
          surface: '#0b0f1a',
          elevated: '#111726',
          card: '#0e1320',
        },
        border: {
          DEFAULT: 'rgba(148, 163, 184, 0.12)',
          strong: 'rgba(148, 163, 184, 0.24)',
        },
        brand: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81',
        },
        bullish: { DEFAULT: '#22c55e', soft: 'rgba(34, 197, 94, 0.14)' },
        bearish: { DEFAULT: '#f43f5e', soft: 'rgba(244, 63, 94, 0.14)' },
        sideways: { DEFAULT: '#f59e0b', soft: 'rgba(245, 158, 11, 0.14)' },
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.5)',
        glow: '0 0 0 1px rgba(99,102,241,0.15), 0 8px 30px -10px rgba(99,102,241,0.35)',
      },
      backgroundImage: {
        'grid-fade': 'linear-gradient(to bottom, rgba(99,102,241,0.06), transparent 60%)',
        'radial-glow': 'radial-gradient(circle at top, rgba(99,102,241,0.18), transparent 60%)',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.55 } },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s ease-out both',
        pulseSoft: 'pulseSoft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
