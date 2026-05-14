
import os

path = r'c:\Users\SAURABH KUMAR\Desktop\NirnayPath\public\script.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_show_view = """function showView(id) {
    const target = document.getElementById(id);
    if (!target) return;

    /* Close all active views */
    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
    });

    /* Special handling for certain views layout */
    target.style.display = (id === 'dashboard' || id === 'login-view' ? 'block' : 'flex');
    
    /* Trigger reflow */
    void target.offsetWidth;
    
    /* Activate target view */
    target.classList.add('active');
    
    /* Scroll to top on view change for UX consistency */
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
"""

# Replace lines 159 to 184 (the whole function block)
start_idx = 159 - 1
end_idx = 184 # Approximate end of the function block from view_file

result = lines[:start_idx] + [new_show_view] + lines[end_idx:]

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(result)

print('SUCCESS: showView function refactored in script.js')
