/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	corePlugins: {
		preflight: true
	},
	theme: {
		extend: {
			colors: {
				metro: {
					blue: '#0078D7',
					teal: '#008272',
					green: '#107C10',
					orange: '#FF8C00',
					red: '#E81123',
					yellow: '#FFB900',
					purple: '#5C2D91'
				},
				gantt: {
					background: '#F9FAFB', // 全体背景
					gridLine: '#E5E7EB', // ガントグリッド線
					task: '#3B82F6', // タスクバーのデフォルト色
					summary: '#1E3A8A' // サマリータスクバー色
				}
			},
			borderRadius: {
				lg: '0.5rem',
				xl: '1rem',
				'2xl': '1.5rem'
			},
			spacing: {
				'task-row': '36px'
			},
			fontFamily: {
				sans: ['"Segoe UI"', 'ui-sans-serif', 'system-ui']
			}
		}
	},
	plugins: [require('@tailwindcss/typography')],
	darkMode: 'class' // 将来的なダークモード対応も可能に
};
