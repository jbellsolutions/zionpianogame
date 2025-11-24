/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'minecraft': ['Press Start 2P', 'cursive'],
      },
      colors: {
        'minecraft-green': '#00AA00',
        'minecraft-brown': '#8B4513',
        'minecraft-grass': '#7CBD6B',
        'minecraft-dirt': '#8B6914',
        'minecraft-stone': '#7F7F7F',
      },
      boxShadow: {
        'pixel': '4px 4px 0px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
