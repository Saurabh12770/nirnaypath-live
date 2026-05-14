
import os
import sys

def patch_file(path, target_start_line, target_end_line, new_content):
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Lines are 1-indexed in the prompt, so subtract 1
    start_idx = target_start_line - 1
    end_idx = target_end_line
    
    result = lines[:start_idx] + [new_content + '\n'] + lines[end_idx:]
    
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(result)
    print(f'SUCCESS: Patched lines {target_start_line}-{target_end_line}')

if __name__ == '__main__':
    path = r'c:\Users\SAURABH KUMAR\Desktop\NirnayPath\public\style.css'
    
    # Patch Palette Buttons
    palette_btn_css = """.p-btn {
    aspect-ratio: 1;
    border: 1.5px solid var(--border-color);
    border-radius: var(--r-sm);
    font-weight: var(--fw-bold);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    color: var(--text-main);
    position: relative;
    font-family: inherit;
}

[data-theme="dark"] .p-btn {
    background: var(--bg-tertiary);
    border-color: var(--border-color);
    color: var(--text-main);
}

.p-btn:hover {
    transform: translateY(-2px) scale(1.08);
    box-shadow: var(--shadow-md);
    z-index: 2;
}

.p-btn.not-visited {
    background: var(--bg-tertiary);
    color: var(--text-muted);
    border-color: var(--border-color);
}

.p-btn.not-answered {
    background: var(--danger);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.p-btn.answered {
    background: var(--success);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.p-btn.marked {
    background: var(--warning);
    color: #fff;
    border-color: transparent;
    border-radius: var(--r-full);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.p-btn.answered-marked {
    background: var(--accent);
    color: #fff;
    border-color: transparent;
    border-radius: var(--r-full);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.p-btn.current {
    border: 2px solid var(--secondary);
    box-shadow: 0 0 0 4px var(--secondary-light);
    transform: scale(1.1);
    z-index: 3;
}"""
    patch_file(path, 3937, 4002, palette_btn_css)
