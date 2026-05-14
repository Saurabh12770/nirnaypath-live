
import os

path = r'c:\Users\SAURABH KUMAR\Desktop\NirnayPath\public\script.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_slide_in = """function slideIn(dir = 'next') {
    const area = document.querySelector('.question-area');
    if (!area) return;
    
    /* Remove existing animation classes */
    area.classList.remove('slide-next', 'slide-prev');
    
    /* Trigger reflow to restart animation */
    void area.offsetWidth;
    
    /* Apply new animation class */
    area.classList.add(dir === 'next' ? 'slide-next' : 'slide-prev');
}
"""

# Replace lines 1310 to 1321 (0-indexed 1309 to 1321)
# Note: The line numbers from view_file are 1-indexed.
start_idx = 1310 - 1
end_idx = 1321

result = lines[:start_idx] + [new_slide_in] + lines[end_idx:]

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(result)

print('SUCCESS: slideIn function modernized in script.js')
