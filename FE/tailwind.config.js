/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        }
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%': { opacity: '0', transform: 'translateY(-24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-left': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-right': {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'zoom-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'zoom-out': {
          '0%': { opacity: '0', transform: 'scale(1.08)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'flip-up': {
          '0%': { opacity: '0', transform: 'perspective(800px) rotateX(40deg)' },
          '100%': { opacity: '1', transform: 'perspective(800px) rotateX(0deg)' },
        },
        'flip-down': {
          '0%': { opacity: '0', transform: 'perspective(800px) rotateX(-40deg)' },
          '100%': { opacity: '1', transform: 'perspective(800px) rotateX(0deg)' },
        },
        'roll-in': {
          '0%': { opacity: '0', transform: 'translateX(-40px) rotate(-15deg)' },
          '100%': { opacity: '1', transform: 'translateX(0) rotate(0deg)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.03)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'heartbeat': {
          '0%, 100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.1)' },
          '30%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.15)' },
          '60%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-down': 'fade-down 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-left': 'fade-left 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-right': 'fade-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'zoom-in': 'zoom-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'zoom-out': 'zoom-out 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'flip-up': 'flip-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'flip-down': 'flip-down 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'roll-in': 'roll-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'bounce-subtle': 'bounce 1.5s infinite',
        'float-slow': 'float-slow 3.5s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
