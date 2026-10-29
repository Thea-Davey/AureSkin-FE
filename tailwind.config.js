/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // ── COLORS (extracted from Figma & theme.colors) ──────
      colors: {
        // Primary palette (olive/sage green from backgrounds)
        primary: {
          DEFAULT: "#6B7B4C",   // Main olive green (bg, nav bar active)
          light:   "#8A9A6D",   // Lighter olive (hover, subtle bg)
          dark:    "#4F5C38",   // Darker olive (pressed states)
        },
        // Secondary palette (warm beige/brown from CTAs)
        secondary: {
          DEFAULT: "#D4A574",   // Warm beige (Sign In button, CTA)
          light:   "#E2BFA0",   // Light beige (card highlights)
          dark:    "#B8895A",   // Darker brown (pressed CTA)
        },
        // Accent (green indicators, health scores)
        accent: {
          DEFAULT: "#4CAF50",   // Green (health score ring, badges)
          light:   "#A5D6A7",   // Light green (background tint)
        },
        // Direct theme tokens (matching theme.colors)
        background: "#F5F0EB",
        card:       "#FFFFFF",
        text:       "#2D2D2D",
        muted:      "#8A8A8A",
        border:     "#E8E0D8",
        error:      "#E53935",

        // Neutrals
        neutral: {
          white:   "#FFFFFF",
          offwhite:"#F5F0EB",   // Warm off-white (page backgrounds)
          card:    "#FFFFFF",   // Card background
          border:  "#E8E0D8",   // Subtle warm border
          text:    "#2D2D2D",   // Primary text (near-black)
          muted:   "#8A8A8A",   // Secondary/muted text
          placeholder: "#B0B0B0", // Input placeholder text
        },
        // Status
        status: {
          error:   "#E53935",   // Red for errors
          warning: "#FFA726",   // Orange for warnings
          success: "#4CAF50",   // Green for success
          info:    "#42A5F5",   // Blue for info
        },
      },

      // ── FONT FAMILY ────────────────────────────────────────
      fontFamily: {
        sans:       ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        "sans-bold": ["Inter_700Bold"],
        heading:    ["Outfit_700Bold"],
      },

      // ── FONT SIZE PRESETS ──────────────────────────────────
      fontSize: {
        "display":  ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "h1":       ["26px", { lineHeight: "34px", fontWeight: "700" }],
        "h2":       ["22px", { lineHeight: "30px", fontWeight: "600" }],
        "h3":       ["18px", { lineHeight: "26px", fontWeight: "600" }],
        "body":     ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm":  ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "caption":  ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "label":    ["14px", { lineHeight: "20px", fontWeight: "500" }],
      },

      // ── BORDER RADIUS ──────────────────────────────────────
      borderRadius: {
        card:    "16px",    // Cards, containers
        button:  "12px",    // Buttons
        input:   "10px",    // Input fields
        badge:   "20px",    // Badges, pills
        full:    "9999px",  // Circles (avatar, health ring)
      },
    },
  },
  plugins: [],
};
