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
        background: 'var(--bg-main)',
        sidebar: 'var(--bg-sidebar)',
        surface: {
          DEFAULT: 'var(--surface-secondary)',
          card: 'var(--surface-card)',
          secondary: 'var(--surface-secondary)',
          hover: 'var(--surface-hover)',
          border: 'var(--border-color)',
          subtle: 'var(--border-subtle)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
          subtle: 'var(--border-subtle)',
        },
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        accent: {
          DEFAULT: 'var(--accent-sage)',
          hover: 'var(--accent-hover)',
          soft: 'var(--accent-soft)',
        },
        graphite: 'var(--deep-graphite)',
        semantic: {
          urgent: {
            DEFAULT: 'var(--semantic-urgent-text)',
            bg: 'var(--semantic-urgent-bg)',
            border: 'var(--semantic-urgent-border)',
          },
          important: {
            DEFAULT: 'var(--semantic-important-text)',
            bg: 'var(--semantic-important-bg)',
            border: 'var(--semantic-important-border)',
          },
          info: {
            DEFAULT: 'var(--semantic-info-text)',
            bg: 'var(--semantic-info-bg)',
            border: 'var(--semantic-info-border)',
          },
          success: {
            DEFAULT: 'var(--semantic-success-text)',
            bg: 'var(--semantic-success-bg)',
            border: 'var(--semantic-success-border)',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      },
      animation: {
        'fade-in': 'fadeIn 0.18s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
