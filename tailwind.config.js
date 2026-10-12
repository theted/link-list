/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: token("paper"),
        surface: token("surface"),
        ink: token("ink"),
        "ink-soft": token("ink-soft"),
        rule: token("rule"),
        link: token("link"),
        visited: token("visited"),
        danger: token("danger"),
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque Variable"', "system-ui", "sans-serif"],
      },
      fontSize: {
        // Major-third scale on a 15px UI base
        xs: ["0.8125rem", { lineHeight: "1.25rem" }],
        sm: ["0.9375rem", { lineHeight: "1.4rem" }],
        base: ["1.0625rem", { lineHeight: "1.55rem" }],
        lg: ["1.3125rem", { lineHeight: "1.75rem" }],
        xl: ["1.6875rem", { lineHeight: "2rem" }],
        "2xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
    },
  },
  plugins: [],
};
