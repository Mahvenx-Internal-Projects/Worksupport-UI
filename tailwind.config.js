/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#EEF1FF', 100:'#D5DBFF', 200:'#A8B4FF', 400:'#5C73F2', 600:'#1B3FD4', 700:'#1330A8', 800:'#0D2180', 900:'#071450' },
        accent: { 400:'#FF8C55', 600:'#FF6B35', 800:'#C44E1A' },
        surface: { 0:'#FFFFFF', 50:'#F8F9FF', 100:'#F0F2FF', 200:'#E8EAFF' },
      },
      fontFamily: { display:["'DM Sans'","sans-serif"], body:["'DM Sans'","sans-serif"], mono:["'JetBrains Mono'","monospace"] },
      borderRadius: { xl2:'1rem', xl3:'1.5rem' },
      animation: { 'fade-in':'fadeIn .35s ease forwards', 'slide-up':'slideUp .4s ease forwards' },
      keyframes: { fadeIn:{'0%':{opacity:0},'100%':{opacity:1}}, slideUp:{'0%':{transform:'translateY(16px)',opacity:0},'100%':{transform:'translateY(0)',opacity:1}} }
    }
  },
  plugins: []
}
