/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  preprocessorOptions: {
    scss: {
      additionalData: '@import "@scss/shared.scss";'
    }
  }

};
