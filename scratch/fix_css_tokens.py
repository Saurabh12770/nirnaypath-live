
import os

path = r'c:\Users\SAURABH KUMAR\Desktop\NirnayPath\public\style.css'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_tokens = [
    ':root {\n',
    '    /* --- 1.1 Core Branding Colors --- */\n',
    '    --primary: #4F46E5;\n',
    '    --primary-dark: #4338CA;\n',
    '    --primary-light: rgba(79, 70, 229, 0.12);\n',
    '    --secondary: #F97316;\n',
    '    --secondary-dark: #EA580C;\n',
    '    --secondary-light: rgba(249, 115, 22, 0.12);\n',
    '    --accent: #8B5CF6;\n',
    '    --success: #10B981;\n',
    '    --danger: #EF4444;\n',
    '    --warning: #F59E0B;\n',
    '    --info: #3B82F6;\n',
    '\n',
    '    /* --- 1.2 Neutral Palette (Light Mode) --- */\n',
    '    --bg-main: #FFFFFF;\n',
    '    --bg-secondary: #F8FAFC;\n',
    '    --bg-tertiary: #F1F5F9;\n',
    '    --card-bg: #FFFFFF;\n',
    '    --border-color: #E2E8F0;\n',
    '    --text-main: #0F172A;\n',
    '    --text-secondary: #475569;\n',
    '    --text-muted: #64748B;\n',
    '    --text-light: #94A3B8;\n',
    '\n',
    '    /* --- 1.3 Premium Gradients --- */\n',
    '    --gradient: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);\n',
    '    --gradient-warm: linear-gradient(135deg, var(--secondary) 0%, #EC4899 100%);\n',
    '    --gradient-surface: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);\n',
    '\n',
    '    /* --- 1.4 Spacing & Scale --- */\n',
    '    --sp-05: 0.25rem;\n',
    '    --sp-1: 0.5rem;\n',
    '    --sp-2: 1rem;\n',
    '    --sp-3: 1.5rem;\n',
    '    --sp-4: 2rem;\n',
    '    --sp-5: 2.5rem;\n',
    '    --sp-6: 3rem;\n',
    '    --sp-8: 4rem;\n',
    '\n',
    '    /* --- 1.5 Border Radius --- */\n',
    '    --r-sm: 8px;\n',
    '    --r-md: 12px;\n',
    '    --r-lg: 16px;\n',
    '    --r-xl: 24px;\n',
    '    --r-full: 9999px;\n',
    '\n',
    '    /* --- 1.6 Elevation & Shadows --- */\n',
    '    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);\n',
    '    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);\n',
    '    --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1);\n',
    '    --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1);\n',
    '    --shadow-premium: 0 20px 40px rgba(79, 70, 229, 0.08);\n',
    '    --shadow-hover: 0 30px 60px rgba(79, 70, 229, 0.12);\n',
    '\n',
    '    /* --- 1.7 Z-Index Scale --- */\n',
    '    --z-negative: -1;\n',
    '    --z-base: 1;\n',
    '    --z-dropdown: 100;\n',
    '    --z-sticky: 1100;\n',
    '    --z-modal-overlay: 10000;\n',
    '    --z-modal: 10001;\n',
    '    --z-toast: 11000;\n',
    '\n',
    '    /* --- 1.8 Typography Scale --- */\n',
    '    --fw-regular: 400;\n',
    '    --fw-medium: 500;\n',
    '    --fw-semibold: 600;\n',
    '    --fw-bold: 700;\n',
    '    --fw-black: 900;\n',
    '}\n',
    '\n',
    '[data-theme="dark"] {\n',
    '    --bg-main: #0F172A;\n',
    '    --bg-secondary: #1E293B;\n',
    '    --bg-tertiary: #334155;\n',
    '    --card-bg: #1E293B;\n',
    '    --border-color: rgba(148, 163, 184, 0.15);\n',
    '    --text-main: #F8FAFC;\n',
    '    --text-secondary: #CBD5E1;\n',
    '    --text-muted: #94A3B8;\n',
    '    --text-light: #64748B;\n',
    '\n',
    '    --gradient-surface: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);\n',
    '    --shadow-premium: 0 20px 40px rgba(0, 0, 0, 0.4);\n',
    '    --shadow-hover: 0 30px 60px rgba(0, 0, 0, 0.5);\n',
    '    \n',
    '    --primary-light: rgba(96, 165, 250, 0.15);\n',
    '}\n'
]

# Find where the reset section starts
reset_start = -1
for i, line in enumerate(lines):
    if '2. FORENSIC RESET' in line:
        reset_start = i
        break

if reset_start != -1:
    result = new_tokens + lines[reset_start:]
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(result)
    print('SUCCESS: Design tokens standardized.')
else:
    print('ERROR: Reset section not found.')
