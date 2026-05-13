/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        grotesk: ['Space Grotesk', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        canvas:   '#07090F',
        surface:  '#0D1117',
        raised:   '#161B22',
        edge:     '#1C2535',
        'edge-hi':'#2D3D57',
        chalk:    '#E6EDF3',
        ash:      '#7D8FA9',
        dim:      '#3D4F68',
        teal:     '#00C9B8',
        'teal-hi':'#00B3A4',
        'teal-dim':'#051F1E',
        'f-blue':   '#5B8EFF',
        'f-green':  '#34D399',
        'f-violet': '#B17AF5',
        'f-amber':  '#FBBF24',
        'f-red':    '#F87171',
      },
    },
  },
  plugins: [],
}
