/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0D',
        panel: '#16161B',
        panel2: '#1E1E25',
        accent: '#FF3B4E',
        accentDim: '#C4293A',
        accent2: '#4C8DFF',
        paper: '#F5F3ED',
        muted: '#8E8E97',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      backgroundImage: {
        halftone: 'radial-gradient(circle, rgba(255,59,78,0.18) 1px, transparent 1.4px)',
        'glow-radial': 'radial-gradient(circle, rgba(255,59,78,0.25) 0%, transparent 70%)',
      },
      backgroundSize: {
        halftone: '10px 10px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,59,78,0.4), 0 8px 24px rgba(255,59,78,0.15)',
        card: '0 4px 20px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
