/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      fontFamily: {
        // Material Design 3 typography system
        sans: ['Roboto Flex', 'Inter var', 'system-ui', 'sans-serif'],
        display: ['Roboto Flex', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        // Material Design type scale aliases
        'display-large': ['Roboto Flex', 'system-ui', 'sans-serif'],
        'display-medium': ['Roboto Flex', 'system-ui', 'sans-serif'],
        'display-small': ['Roboto Flex', 'system-ui', 'sans-serif'],
        'headline-large': ['Roboto Flex', 'system-ui', 'sans-serif'],
        'headline-medium': ['Roboto Flex', 'system-ui', 'sans-serif'],
        'headline-small': ['Roboto Flex', 'system-ui', 'sans-serif'],
        'title-large': ['Roboto Flex', 'system-ui', 'sans-serif'],
        'title-medium': ['Roboto Flex', 'system-ui', 'sans-serif'],
        'title-small': ['Roboto Flex', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Material Design 3 color system
        primary: {
          0: '#000000',
          10: '#21005E',
          20: '#381E72',
          30: '#4F378B',
          40: '#6750A4',
          50: '#7F67BE',
          60: '#9A82DB',
          70: '#B69DF8',
          80: '#D0BCFF',
          90: '#EADDFF',
          95: '#F6EDFF',
          99: '#FFFBFF',
          100: '#FFFFFF',
        },
        secondary: {
          0: '#000000',
          10: '#1D192B',
          20: '#332D41',
          30: '#4A4458',
          40: '#625B71',
          50: '#7A7289',
          60: '#958DA5',
          70: '#B0A7C0',
          80: '#CCC2DC',
          90: '#E8DEF8',
          95: '#F6EDFF',
          99: '#FFFBFF',
          100: '#FFFFFF',
        },
        tertiary: {
          0: '#000000',
          10: '#31111D',
          20: '#492532',
          30: '#633B48',
          40: '#7D5260',
          50: '#986977',
          60: '#B58392',
          70: '#D29DAC',
          80: '#EFB8C8',
          90: '#FFD8E4',
          95: '#FFECF1',
          99: '#FFFBFF',
          100: '#FFFFFF',
        },
        error: {
          0: '#000000',
          10: '#410E0B',
          20: '#601410',
          30: '#8C1D18',
          40: '#B3261E',
          50: '#DC362E',
          60: '#E46962',
          70: '#EC928E',
          80: '#F2B8B5',
          90: '#F9DEDC',
          95: '#FCEEEE',
          99: '#FFFBF9',
          100: '#FFFFFF',
        },
        neutral: {
          0: '#000000',
          10: '#1C1B1F',
          20: '#313033',
          30: '#484649',
          40: '#605D62',
          50: '#787579',
          60: '#939094',
          70: '#AEAAAE',
          80: '#C9C5CA',
          90: '#E6E1E5',
          95: '#F4EFF4',
          99: '#FFFBFF',
          100: '#FFFFFF',
        },
        // Material Design 3 surface and container colors
        surface: {
          DEFAULT: '#FFFBFF', // surface light
          dim: '#DED8E1',     // surface-dim light
          bright: '#FFFBFF',  // surface-bright light
          container: {
            lowest: '#FFFFFF',  // surface-container-lowest light
            low: '#F7F2FA',     // surface-container-low light
            DEFAULT: '#F3EDF7', // surface-container light
            high: '#ECE6F0',    // surface-container-high light
            highest: '#E6E0E9', // surface-container-highest light
          },
        },
        // Material Design 3 on-surface colors
        'on-surface': {
          DEFAULT: '#1C1B1F',    // on-surface light
          variant: '#49454F',    // on-surface-variant light
          inverse: '#F4EFF4',    // inverse-on-surface light
        },
        // Material Design 3 on-primary colors
        'on-primary': {
          DEFAULT: '#FFFFFF',    // on-primary
          container: '#21005E',  // on-primary-container
          inverse: '#D0BCFF',    // inverse-primary
        },
        // Material Design 3 on-secondary colors
        'on-secondary': {
          DEFAULT: '#FFFFFF',    // on-secondary
          container: '#1D192B',  // on-secondary-container
        },
        // Material Design 3 on-tertiary colors
        'on-tertiary': {
          DEFAULT: '#FFFFFF',    // on-tertiary
          container: '#31111D',  // on-tertiary-container
        },
        // Material Design 3 on-error colors
        'on-error': {
          DEFAULT: '#FFFFFF',    // on-error
          container: '#410E0B',  // on-error-container
        },
        // Keep the modern palette for backward compatibility
        modern: {
          bg: {
            light: '#FFFBFF', // Updated to Material 3 surface
            dark: '#1C1B1F',  // Updated to Material 3 neutral-10
          },
          sidebar: {
            light: '#F3EDF7', // Updated to Material 3 surface-container
            dark: '#313033',  // Updated to Material 3 neutral-20
          },
          card: {
            light: '#F7F2FA', // Updated to Material 3 surface-container-low
            dark: '#313033',  // Updated to Material 3 neutral-20
          },
          accent: {
            purple: '#6750A4', // Updated to Material 3 primary-40
            blue: '#6750A4',   // Updated to Material 3 primary-40
            indigo: '#7F67BE', // Updated to Material 3 primary-50
            teal: '#7D5260',   // Updated to Material 3 tertiary-40
            emerald: '#625B71', // Updated to Material 3 secondary-40
          },
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'gradient-x': 'gradientX 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: 0 },
          '70%': { transform: 'scale(1.05)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
      boxShadow: {
        // Material Design 3 elevation system
        'elevation-0': 'none',
        'elevation-1': '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
        'elevation-2': '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
        'elevation-3': '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.30)',
        'elevation-4': '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.30)',
        'elevation-5': '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.30)',
        // Keep existing shadows for backward compatibility
        'glow': '0 0 15px rgba(103, 80, 164, 0.5)', // Updated to primary-40
        'glow-lg': '0 0 25px rgba(103, 80, 164, 0.6)', // Updated to primary-40
        'soft': '0 2px 15px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 5px 25px rgba(0, 0, 0, 0.07)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'modern': '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)', // Updated to elevation-1
        'modern-lg': '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.30)', // Updated to elevation-3
      },
      borderRadius: {
        // Material Design 3 shape system
        'none': '0px',
        'extra-small': '4px',
        'small': '8px',
        'medium': '12px',
        'large': '16px',
        'extra-large': '28px',
        'full': '9999px',
        // Keep existing border radius for backward compatibility
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'shadow': 'box-shadow',
        'all': 'all',
      },
      transitionDuration: {
        // Material Design 3 motion durations
        '0': '0ms',
        'extra-short': '50ms',
        'short': '100ms',
        'medium': '250ms',
        'long': '400ms',
        'extra-long': '500ms',
        // Keep existing durations
        '400': '400ms',
      },
      transitionTimingFunction: {
        // Material Design 3 easing curves
        'standard': 'cubic-bezier(0.2, 0.0, 0, 1.0)',
        'standard-accelerate': 'cubic-bezier(0.3, 0.0, 1.0, 1.0)',
        'standard-decelerate': 'cubic-bezier(0.0, 0.0, 0.0, 1.0)',
        'emphasized': 'cubic-bezier(0.2, 0.0, 0, 1.0)',
        'emphasized-accelerate': 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
        'emphasized-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
        // Keep existing timing functions
        'bounce-in': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
