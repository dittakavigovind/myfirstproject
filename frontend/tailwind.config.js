/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                astro: {
                    yellow: 'var(--theme-secondary)', // #FFF500
                    navy: 'var(--theme-primary)',   // #1A237E
                    dark: '#0D1117',
                    light: '#F5F5F7',
                    accent: 'var(--theme-accent)'
                }
            },
            fontFamily: {
                sans: ['var(--font-poppins)', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
