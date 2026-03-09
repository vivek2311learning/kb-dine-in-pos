import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wood: {
          light: '#f3e6d6',
          base: '#e0c4a2',
          dark: '#b07a45',
          deep: '#7a4a2e',
        },
        ink: '#3b2a1a',
      },

      fontFamily: {
        rustic: ['var(--font-rustic)', 'serif'],
        body: ['var(--font-body)', 'serif'],
      },

      boxShadow: {
        wood: '0 4px 10px rgba(122, 74, 46, 0.35)',
        insetWood: 'inset 0 2px 4px rgba(0,0,0,0.25)',
      },

      borderRadius: {
        wood: '10px',
      },

      backgroundImage: {
        paper: "url('/textures/paper.png')",
        wood: "url('/textures/wood.png')",
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
