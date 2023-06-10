export default {
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    }
  },
  plugins: [],
  nitro: {
    preset: 'vercel-edge',
  },
};
