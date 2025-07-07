import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        pingin: {
          primary: '#7209b7',
          secondary: '#a663cc',
          accent: '#d4adfc',
          dark: '#0a0015',
          'dark-alt': '#1a0033',
          'dark-blue': '#2d1b69',
        }
      },
      backgroundImage: {
        'pingin-gradient': 'linear-gradient(135deg, #0a0015 0%, #1a0033 25%, #2d1b69 50%, #7209b7 75%, #a663cc 100%)',
        'pingin-shape': 'linear-gradient(45deg, #7209b7, #a663cc)',
        'pingin-text': 'linear-gradient(45deg, #ffffff, #d4adfc)',
        'pingin-button': 'linear-gradient(45deg, #7209b7, #a663cc)',
        'pingin-progress': 'linear-gradient(90deg, #7209b7, #a663cc)',
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'float-delayed-5s': 'float 20s ease-in-out infinite -5s',
        'float-delayed-10s': 'float 20s ease-in-out infinite -10s',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-30px) rotate(180deg)' },
        }
      },
      backdropBlur: {
        '20': '20px',
      },
      clipPath: {
        triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)',
      }
    },
  },
  plugins: [],
}

export default config