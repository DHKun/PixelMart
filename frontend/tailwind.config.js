/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'sans': ['"Courier New"', 'monospace'],
      },
      colors: {
        'pixel-dark': '#0f0f23',
        'pixel-darker': '#0a0a1a',
        'pixel-accent': '#00ff41',
        'pixel-blue': '#00bfff',
        'pixel-yellow': '#ffd700',
        'pixel-red': '#ff4444',
        'pixel-pink': '#ff69b4',
        'pixel-orange': '#ff8c00',
        'pixel-purple': '#a855f7',
      },
      animation: {
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'rainbow': 'rainbow 4s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 5px #00ff41, 0 0 10px #00ff41' },
          '100%': { textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41' },
        },
        rainbow: {
          '0%': { color: '#ff4444' },
          '20%': { color: '#ff8c00' },
          '40%': { color: '#ffd700' },
          '60%': { color: '#00ff41' },
          '80%': { color: '#00bfff' },
          '100%': { color: '#a855f7' },
        },
      },
    },
  },
  plugins: [],
}
