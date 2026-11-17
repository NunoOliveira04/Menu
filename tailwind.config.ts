import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Neutros quentes da marca (painel e login), a combinar com a página de apresentação.
      // Contraste AA do texto: 500 sobre branco 5,8:1 e sobre o papel (50) 5,3:1.
      colors: {
        stone: {
          50: '#FBF6EC',
          100: '#F3EADB',
          200: '#E8DCC9',
          300: '#D5C6B3',
          400: '#A08D80',
          500: '#75625A',
          600: '#5F4B40',
          700: '#4F3E34',
          800: '#3B2A21',
          900: '#2B1D16',
          950: '#1E140F',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
