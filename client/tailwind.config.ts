import type { Config } from 'tailwindcss'

export default {
darkMode: 'class',
content: ['./index.html', './src/**/*.{ts,tsx}'],
theme: {
extend: {
colors: {
// These will be replaced by Stitch output. Default is clean neutral SaaS palette.
brand: {
50:  '#fef9ee',
100: '#fdf0d2',
200: '#fbdea5',
300: '#f8c66d',
400: '#f4a532',
500: '#f18c0f',  // primary amber — adjust to Stitch output
600: '#e27208',
700: '#bc5509',
800: '#96420f',
900: '#7a380f',
950: '#421b04',
},
surface: {
0:   '#ffffff',
1:   '#f9fafb',
2:   '#f3f4f6',
},
border: {
DEFAULT: '#e5e7eb',
focus:   '#6b7280',
},
text: {
primary:   '#111827',
secondary: '#374151',
muted:     '#6b7280',
accent:    '#f18c0f',
},
status: {
available: '#10b981',
ontrip:    '#3b82f6',
inshop:    '#f59e0b',
retired:   '#9ca3af',
suspended: '#ef4444',
draft:     '#6b7280',
dispatched:'#3b82f6',
completed: '#10b981',
cancelled: '#ef4444',
}
},
fontFamily: {
sans: ['Inter', 'system-ui', 'sans-serif'],
mono: ['JetBrains Mono', 'monospace'],
},
fontSize: {
'xs':  ['11px', { lineHeight: '16px' }],
'sm':  ['12px', { lineHeight: '18px' }],
'base':['14px', { lineHeight: '20px' }],
'lg':  ['16px', { lineHeight: '24px' }],
'xl':  ['18px', { lineHeight: '28px' }],
'2xl': ['24px', { lineHeight: '32px' }],
},
borderRadius: {
DEFAULT: '8px',
'sm': '6px',
'lg': '12px',
'xl': '16px',
},
boxShadow: {
card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
modal:'0 20px 60px -10px rgb(0 0 0 / 0.15)',
}
}
},
plugins: []
} satisfies Config
