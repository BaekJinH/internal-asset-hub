/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
  	extend: {
  		colors: {
  			background: 'rgb(var(--background) / <alpha-value>)',
  			foreground: 'rgb(var(--foreground) / <alpha-value>)',
  			card: {
  				DEFAULT: 'rgb(var(--card) / <alpha-value>)',
  				foreground: 'rgb(var(--card-foreground) / <alpha-value>)'
  			},
  			muted: {
  				DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
  				foreground: 'rgb(var(--muted-foreground) / <alpha-value>)'
  			},
  			primary: {
  				DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
  				foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
  				hover: 'rgb(var(--primary-hover) / <alpha-value>)',
  				muted: 'rgb(var(--primary-muted) / <alpha-value>)',
  				'muted-foreground': 'rgb(var(--primary-muted-foreground) / <alpha-value>)'
  			},
  			secondary: {
  				DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
  				foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)'
  			},
  			accent: {
  				DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
  				foreground: 'rgb(var(--accent-foreground) / <alpha-value>)'
  			},
  			destructive: {
  				DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
  				foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)'
  			},
  			border: 'rgb(var(--border) / <alpha-value>)',
  			input: 'rgb(var(--input) / <alpha-value>)',
  			ring: 'rgb(var(--ring) / <alpha-value>)',
  			popover: {
  				DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
  				foreground: 'rgb(var(--popover-foreground) / <alpha-value>)'
  			},
			sidebar: {
				DEFAULT: 'rgb(var(--sidebar) / <alpha-value>)',
				foreground: 'rgb(var(--sidebar-foreground) / <alpha-value>)',
				muted: 'rgb(var(--sidebar-muted) / <alpha-value>)',
				accent: 'rgb(var(--sidebar-accent) / <alpha-value>)',
				'accent-foreground': 'rgb(var(--sidebar-accent-foreground) / <alpha-value>)',
				primary: 'rgb(var(--sidebar-primary) / <alpha-value>)',
				'primary-foreground': 'rgb(var(--sidebar-primary-foreground) / <alpha-value>)',
				border: 'rgb(var(--sidebar-border) / <alpha-value>)',
				ring: 'rgb(var(--sidebar-ring) / <alpha-value>)',
			},
  			success: {
  				DEFAULT: 'rgb(var(--success) / <alpha-value>)',
  				foreground: 'rgb(var(--success-foreground) / <alpha-value>)',
  				muted: 'rgb(var(--success-muted) / <alpha-value>)'
  			},
  			warning: {
  				DEFAULT: 'rgb(var(--warning) / <alpha-value>)',
  				foreground: 'rgb(var(--warning-foreground) / <alpha-value>)',
  				muted: 'rgb(var(--warning-muted) / <alpha-value>)'
  			},
  			danger: {
  				DEFAULT: 'rgb(var(--danger) / <alpha-value>)',
  				foreground: 'rgb(var(--danger-foreground) / <alpha-value>)',
  				muted: 'rgb(var(--danger-muted) / <alpha-value>)'
  			},
  			info: {
  				DEFAULT: 'rgb(var(--info) / <alpha-value>)',
  				foreground: 'rgb(var(--info-foreground) / <alpha-value>)',
  				muted: 'rgb(var(--info-muted) / <alpha-value>)'
  			},
  			chart: {
  				1: 'rgb(var(--chart-1) / <alpha-value>)',
  				2: 'rgb(var(--chart-2) / <alpha-value>)',
  				3: 'rgb(var(--chart-3) / <alpha-value>)',
  				4: 'rgb(var(--chart-4) / <alpha-value>)',
  				5: 'rgb(var(--chart-5) / <alpha-value>)'
  			}
  		},
  		spacing: {
  			inline: 'var(--space-inline)',
  			field: 'var(--space-field)',
  			'stack-sm': 'var(--space-stack-sm)',
  			stack: 'var(--space-stack)',
  			section: 'var(--space-section)',
  			page: 'var(--space-page)',
  			widget: 'var(--space-widget)',
  			'card-x': 'var(--space-card-x)',
  			'card-y': 'var(--space-card-y)',
  			'card-content': 'var(--space-card-content)',
  			'list-row-y': 'var(--space-list-row-y)',
  			'header-gap': 'var(--space-header-gap)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  			md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  			lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  			xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  			'2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'sans-serif'
  			]
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
}
