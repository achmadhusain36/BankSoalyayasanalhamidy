/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Use the standard plugin key 'tailwindcss' — '@tailwindcss/postcss' is not the plugin entry
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
