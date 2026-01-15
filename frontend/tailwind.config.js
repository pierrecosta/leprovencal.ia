/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        provencesage: "var(--provence-sage)",
        provenceolive: "var(--provence-olive)",
        provencesand: "var(--provence-sand)",
        provencelavender: "var(--provence-lavender)",
        provenceplum: "var(--provence-plum)",

        surface: "var(--surface)",
        surfaceContrast: "var(--surface-contrast)",
        borderProvence: "var(--border)",

        primary: "var(--primary)",
        primaryContrast: "var(--primary-contrast)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        bg: "var(--bg)",
        text: "var(--text)",
        heading: "var(--heading)",
        muted: "var(--text-muted)",
        link: "var(--link)",
        linkHover: "var(--link-hover)",
      },
      boxShadow: {
        "sm-provence": "var(--shadow-sm)",
        "md-provence": "var(--shadow-md)",
        "lg-provence": "var(--shadow-lg)",
      },
      borderRadius: {
        provence: "var(--radius)",
      },
      container: {
        center: true,
        padding: "1rem",
      },
      fontFamily: {
        sans: [
          "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Inter", "Roboto",
          "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "sans-serif"
        ],
      },
    },
  },
  plugins: [],
};
