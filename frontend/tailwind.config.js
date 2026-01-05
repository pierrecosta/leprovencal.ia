
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Palette Provence
        provencesage: "#7f9b8d",
        provenceolive: "#c0cd49",
        provencesand:  "#efe4ac",
        provencelavender: "#9985b6",
        provenceplum: "#4b3a5e",

        // Surfaces et bordures
        surface: "#f7f1c8",
        surfaceContrast: "#e6dca2",
        borderProvence: "#ddcf9f",

        // Alias pratiques (pour utiliser bg-primary, text-accent, etc.)
        primary: "#4b3a5e",
        primaryContrast: "#f8f6fb",
        secondary: "#9985b6",
        accent: "#c0cd49",
        bg: "#efe4ac",
        text: "#4b3a5e",
      },
      boxShadow: {
        "sm-provence": "0 4px 12px rgba(75, 58, 94, 0.10)",
        "md-provence": "0 8px 20px rgba(75, 58, 94, 0.12)",
        "lg-provence": "0 12px 28px rgba(75, 58, 94, 0.18)",
      },
      borderRadius: {
        provence: "14px",
      },
      container: {
        center: true,
        padding: "1rem",
      },
      fontFamily: {
        // Sans par défaut ; ajoute une serif si nécessaire dans le projet
        sans: [
          "-apple-system","BlinkMacSystemFont","Segoe UI","Inter","Roboto",
          "Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue","sans-serif"
        ],
        mono: [
          "ui-monospace","SFMono-Regular","Menlo","Monaco","Consolas","Liberation Mono","Courier New","monospace"
        ],
      },
    },
  },
  plugins: [
    // Activer si installé : require('@tailwindcss/typography'), require('@tailwindcss/forms')
  ],
};
