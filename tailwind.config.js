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
        highlight: 'rgb(var(--highlight) / <alpha-value>)',
        onaccent: 'rgb(var(--on-accent) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
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
        pop: '4px 4px 0 rgb(var(--accent))',
        'pop-lg': '8px 8px 0 rgb(var(--accent))',
        'pop-ink': '4px 4px 0 rgb(var(--btn-shadow))',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(var(--tilt, 0deg))' },
          '50%': { transform: 'translateY(-8px) rotate(var(--tilt, 0deg))' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
