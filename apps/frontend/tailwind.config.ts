import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        vt323: ['VT323', 'monospace'],
      },
      colors: {
        pingin: {
          primary: '#7209b7',
          secondary: '#a663cc',
          accent: '#d4adfc',
          dark: '#0a0015',
          'dark-alt': '#1a0033',
          'dark-blue': '#2d1b69',
          terminal: {
            green: '#00ff88',
            cyan: '#00ffff',
            orange: '#ffaa00',
          }
        }
      },
      backgroundImage: {
        'pingin-gradient': 'linear-gradient(135deg, #0a0015 0%, #1a0033 25%, #2d1b69 50%, #7209b7 75%, #a663cc 100%)',
        'pingin-shape': 'linear-gradient(45deg, #7209b7, #a663cc)',
        'pingin-text': 'linear-gradient(45deg, #ffffff, #d4adfc)',
        'pingin-button': 'linear-gradient(45deg, #7209b7, #a663cc)',
        'pingin-progress': 'linear-gradient(90deg, #7209b7, #a663cc)',
        'hero-static': 'linear-gradient(45deg, #ffffff, #f0f8ff, #d4adfc, #a663cc)',
        'dynamic-word': 'linear-gradient(45deg, #a663cc, #d4adfc)',
        'dynamic-emphasis': 'linear-gradient(45deg, #ffffff, #f0f8ff)',
        'section-title': 'linear-gradient(45deg, #ffffff, #f0f8ff, #d4adfc)',
        'comparison-bg': 'radial-gradient(ellipse at center, rgba(114, 9, 183, 0.1) 0%, transparent 70%)',
        'features-bg': 'radial-gradient(ellipse at top center, rgba(45, 27, 105, 0.1) 0%, transparent 60%)',
        'testimonials-bg': 'linear-gradient(180deg, transparent, rgba(114, 9, 183, 0.05), transparent)',
        'cta-bg': 'radial-gradient(ellipse at center, rgba(162, 99, 204, 0.15) 0%, transparent 60%)',
        'bg-overlay': 'radial-gradient(circle at 20% 50%, rgba(162, 99, 204, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(114, 9, 183, 0.2) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(45, 27, 105, 0.15) 0%, transparent 50%)',
        'grid-pattern': 'linear-gradient(rgba(162, 99, 204, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(162, 99, 204, 0.1) 1px, transparent 1px)',
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'float-delayed-5s': 'float 20s ease-in-out infinite -5s',
        'float-delayed-10s': 'float 20s ease-in-out infinite -10s',
        'float-move': 'floatMove 20s linear infinite',
        'float-move-delayed': 'floatMove 25s linear infinite',
        'particle-float': 'particleFloat 15s linear infinite',
        'pulse-custom': 'pulseCustom 3s ease-in-out infinite',
        'connection-pulse': 'connectionPulse 4s ease-in-out infinite',
        'grid-move': 'gridMove 20s linear infinite',
        'gradient-shift': 'gradientShift 12s ease infinite',
        'title-flow': 'titleFlow 4s ease-in-out infinite',
        'title-float': 'titleFloat 4s ease-in-out infinite',
        'hero-float': 'heroFloat 15s ease-in-out infinite',
        'icon-float': 'iconFloat 3s ease-in-out infinite',
        'stat-pulse': 'statPulse 3s ease-in-out infinite',
        'cta-pulse': 'ctaPulse 3s ease-in-out infinite',
        'scroll-bounce': 'scrollBounce 2s ease-in-out infinite',
        'scroll-dot': 'scrollDot 2s ease-in-out infinite',
        'underline-glow': 'underlineGlow 2s ease-in-out infinite',
        'message-slide': 'messageSlide 0.5s ease-out',
        'blink-caret': 'blinkCaret 0.75s step-end infinite',
        'typing-bounce': 'typingBounce 1.4s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)', opacity: '0.7' },
          '50%': { transform: 'translateY(-30px) rotate(3deg)', opacity: '1' },
        },
        floatMove: {
          '0%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-100px) translateX(50px) rotate(90deg)' },
          '50%': { transform: 'translateY(-200px) translateX(-30px) rotate(180deg)' },
          '75%': { transform: 'translateY(-150px) translateX(80px) rotate(270deg)' },
          '100%': { transform: 'translateY(0px) translateX(0px) rotate(360deg)' },
        },
        particleFloat: {
          '0%': { transform: 'translateY(100vh) translateX(0px)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100px) translateX(100px)', opacity: '0' },
        },
        pulseCustom: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.5)', opacity: '1' },
        },
        connectionPulse: {
          '0%, 100%': { opacity: '0.1' },
          '50%': { opacity: '0.4' },
        },
        gridMove: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' },
        },
        gradientShift: {
          '0%, 100%': { filter: 'hue-rotate(0deg) brightness(1)' },
          '50%': { filter: 'hue-rotate(15deg) brightness(1.1)' },
        },
        titleFlow: {
          '0%, 100%': { 
            filter: 'drop-shadow(0 0 30px rgba(162, 99, 204, 0.3))',
            transform: 'translateY(0)'
          },
          '50%': { 
            filter: 'drop-shadow(0 0 50px rgba(162, 99, 204, 0.5))',
            transform: 'translateY(-5px)'
          },
        },
        titleFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        heroFloat: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) scale(1)' },
          '33%': { transform: 'translateY(-80px) translateX(40px) scale(1.1)' },
          '66%': { transform: 'translateY(40px) translateX(-60px) scale(0.95)' },
        },
        iconFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(5deg)' },
        },
        statPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        ctaPulse: {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.05)', filter: 'brightness(1.2)' },
        },
        scrollBounce: {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
          '50%': { transform: 'translateX(-50%) translateY(10px)' },
        },
        scrollDot: {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0)', opacity: '1' },
          '50%': { transform: 'translateX(-50%) translateY(10px)', opacity: '0.5' },
        },
        underlineGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scaleX(1)' },
          '50%': { opacity: '1', transform: 'scaleX(1.05)' },
        },
        messageSlide: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        blinkCaret: {
          'from, to': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        typingBounce: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-3px)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      boxShadow: {
        'pingin': '0 15px 50px rgba(114, 9, 183, 0.4)',
        'pingin-hover': '0 25px 70px rgba(114, 9, 183, 0.6)',
        'card': '0 15px 50px rgba(10, 0, 21, 0.3)',
        'card-hover': '0 30px 80px rgba(10, 0, 21, 0.5)',
        'terminal': 'inset 0 2px 10px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.05)',
        'ai-card': '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        'ai-card-hover': '0 30px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
      },
      transitionTimingFunction: {
        'pingin': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [],
}

export default config