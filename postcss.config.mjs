/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Use '@tailwindcss/postcss' as required for Tailwind v4 PostCSS integration
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;
