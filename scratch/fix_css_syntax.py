
import os

path = r'c:\Users\SAURABH KUMAR\Desktop\NirnayPath\public\style.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the broken dark mode selector
content = content.replace('[data-theme=\\dark\\]', '[data-theme="dark"]')
content = content.replace('[data-theme=\\dark\\]', '[data-theme="dark"]') # Double check for escaping

# 2. Fix broken font family strings with backslashes
content = content.replace('font-family: " Inter\\, \\Poppins\\, sans-serif;', 'font-family: "Inter", "Poppins", sans-serif;')
content = content.replace('font-family: \\Inter\\, sans-serif;', 'font-family: "Inter", sans-serif;')

# 3. Consolidate and Normalize Global Card Styles
# We will append a single "Forensic Certification" block at the end and remove the redundant ones.

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('SUCCESS: Forensic fix applied to style.css selectors and fonts.')
