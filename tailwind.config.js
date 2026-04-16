/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // vibrant teal
          600: '#0d9488',
          900: '#134e4a',
        },
        vibrant: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          pink: '#ec4899',
          orange: '#f97316',
        }
      },
      boxShadow: {
        soft: '0 10px 15px -3px rgb(15 23 42 / 0.06), 0 4px 6px -4px rgb(15 23 42 / 0.05)',
        glow: '0 0 20px rgba(20, 184, 166, 0.4)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%)',
        'soft-mesh': 'radial-gradient(at 8% 8%, hsla(224, 88%, 94%, 1) 0px, transparent 50%), radial-gradient(at 89% 19%, hsla(186, 100%, 93%, 1) 0px, transparent 50%), radial-gradient(at 20% 89%, hsla(300, 68%, 95%, 1) 0px, transparent 50%), radial-gradient(at 90% 80%, hsla(339, 100%, 93%, 1) 0px, transparent 50%)'
      },
    },
  },
  plugins: [],
}