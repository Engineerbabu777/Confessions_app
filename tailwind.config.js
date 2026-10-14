/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}" , "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        base:{
          950:"#0B0B0F",
          900:"#121218",
          800:"#1C1C24",
          700:"#2A2A34",
        },
        ember:{
          400:"#FF8F5E",
          500:"#FF7A3D",
          600:"#E8632A",
        },
        mist:{
          400:"#8B8B99",
          300:"#B4B4C2",
          100:"#E8632A",
        },

      }
    },
  },
  plugins: [],
}