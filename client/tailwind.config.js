/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
			colors: {
				// Основні кольори
				dark: '#141619',
				dark2: '#1A1D21',
				light: '#FAFAFA',
				gold: '#D2AB67',
				blue: '#5FA4E6',
				purple: '#665DCD',
				uiError: '#F14668',
				uiDisabled: '#616161',
			},
			backgroundImage: {
				// Градієнт для кнопки
				'gradient-btn':
					'linear-gradient(to right, #665DCD, #5FA4E6, #D2AB67)',
				'gradient-btn-hover':
					'linear-gradient(to right, #D2AB67, #5FA4E6, #665DCD)',
			},
		},
	},
	plugins: [],
};
