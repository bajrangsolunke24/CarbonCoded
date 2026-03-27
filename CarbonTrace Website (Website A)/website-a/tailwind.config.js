/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Editorial earth palette
        'ct-bg': '#fefae0',
        'ct-surface': '#f7f1d4',
        'ct-card': '#ffffff',
        'ct-border': '#d7ddba',
        'ct-hover': '#eef2d6',

        // Primary accents
        'ct-saffron': '#ccd5ae',
        'ct-india': '#a3b18a',
        'ct-navy': '#01472e',

        // Themed semantic accents
        'ct-cyan': '#01472e',
        'ct-emerald': '#5f6f52',
        'ct-amber': '#8fa36d',
        'ct-red': '#9c4f3d',
        'ct-purple': '#7a8c5b',

        // Text
        'ct-text': '#01472e',
        'ct-muted': '#5f6f52',
        'ct-subtle': '#7d8f65',

        // Legacy palette kept for compatibility during migration
        gov: {
          navy: '#01472e',
          blue: '#5f6f52',
          orange: '#a3b18a',
          dark: '#264e36',
          bg: '#fefae0',
          border: '#d7ddba',
          table: '#eef2d6',
          stripe: '#f7f1d4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Anton', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f7f1d4 100%)',
        'gradient-saffron': 'linear-gradient(135deg, #ccd5ae 0%, #a3b18a 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #5f6f52 0%, #01472e 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #01472e 0%, #5f6f52 100%)',
        'gradient-amber': 'linear-gradient(135deg, #a3b18a 0%, #ccd5ae 100%)',
      },
      boxShadow: {
        'glow-cyan': '0 30px 60px rgba(1, 71, 46, 0.16)',
        'glow-emerald': '0 24px 54px rgba(95, 111, 82, 0.18)',
        'glow-saffron': '0 20px 45px rgba(163, 177, 138, 0.2)',
        'card': '0 30px 80px rgba(1, 71, 46, 0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' }
        }
      }
    },
  },
  plugins: [],
};
