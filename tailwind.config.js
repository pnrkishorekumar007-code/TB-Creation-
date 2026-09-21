/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--ink) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        panel2: 'rgb(var(--panel-2) / <alpha-value>)',
        paper: 'rgb(var(--paper) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        accentDim: 'rgb(var(--accent-dim) / <alpha-value>)',
        accent2: 'rgb(var(--accent-2) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      backgroundImage: {
        halftone:
          'radial-gradient(circle, rgb(var(--accent) / 0.18) 1px, transparent 1.4px)',
        'glow-radial':
          'radial-gradient(circle, rgb(var(--accent) / 0.25) 0%, transparent 70%)',
      },
      backgroundSize: {
        halftone: '10px 10px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(var(--accent) / 0.4), 0 8px 24px rgb(var(--accent) / 0.15)',
        card: 'var(--shadow-card)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
  plugins: [],
};