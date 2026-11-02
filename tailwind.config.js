/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface": "#faf8ff",
        "surface-dim": "#d2d9f4",
        "surface-bright": "#faf8ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f3ff",
        "surface-container": "#eaedff",
        "surface-container-high": "#e2e7ff",
        "surface-container-highest": "#dae2fd",
        "on-surface": "#131b2e",
        "on-surface-variant": "#414754",
        "inverse-surface": "#283044",
        "inverse-on-surface": "#eef0ff",
        "outline": "#727785",
        "outline-variant": "#c1c6d6",
        "surface-tint": "#005bc0",
        "primary": "#0058bc",
        "on-primary": "#ffffff",
        "primary-container": "#0070eb",
        "on-primary-container": "#fefcff",
        "inverse-primary": "#adc6ff",
        "secondary": "#855300",
        "on-secondary": "#ffffff",
        "secondary-container": "#fea619",
        "on-secondary-container": "#684000",
        "tertiary": "#006577",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#008096",
        "on-tertiary-container": "#f9fdff",
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "primary-fixed": "#d8e2ff",
        "primary-fixed-dim": "#adc6ff",
        "on-primary-fixed": "#001a41",
        "on-primary-fixed-variant": "#004493",
        "secondary-fixed": "#ffddb8",
        "secondary-fixed-dim": "#ffb95f",
        "on-secondary-fixed": "#2a1700",
        "on-secondary-fixed-variant": "#653e00",
        "tertiary-fixed": "#acedff",
        "tertiary-fixed-dim": "#4cd7f6",
        "on-tertiary-fixed": "#001f26",
        "on-tertiary-fixed-variant": "#004e5c",
        "background": "#faf8ff",
        "on-background": "#131b2e",
        "surface-variant": "#dae2fd"
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px"
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
        "gutter": "1rem"
      }
    },
  },
  plugins: [],
}
