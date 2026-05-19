const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'public', 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Standardize Transitions
// We will define a transition token if it doesn't exist.
if (!css.includes('--trans-smooth')) {
    css = css.replace(':root {', ':root {\n    --trans-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);\n    --trans-smooth: 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n    --trans-bounce: 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);');
}

// Replace transitions (be careful not to ruin complex ones)
css = css.replace(/transition:\s*(all|transform|background-color|background|color|box-shadow|border-color|opacity)\s*[0-9.]+s\s*(ease|ease-in-out|linear|ease-in|ease-out|cubic-bezier\([^)]+\))?\s*;/g, 'transition: $1 var(--trans-smooth);');

// 2. Fix Button Physics
// Find common button classes and ensure they have hover/active states
const buttonSelectors = ['.btn-primary', '.btn-secondary', '.btn-outline', '.hero-btn-primary', '.btn-cbt-save', '.btn-cbt-review'];
buttonSelectors.forEach(btn => {
    // Check if hover exists
    if (!css.includes(`${btn}:hover`)) {
        css += `\n${btn}:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); }`;
    }
    // Check if active exists
    if (!css.includes(`${btn}:active`)) {
        css += `\n${btn}:active { transform: translateY(0) scale(0.98); }`;
    }
    // Check if focus exists
    if (!css.includes(`${btn}:focus-visible`)) {
        css += `\n${btn}:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }`;
    }
});

// 3. Fix Card Interaction System
const cardSelectors = ['.card', '.np-card', '.feature-card', '.subject-card', '.testimonial-card'];
cardSelectors.forEach(card => {
    if (!css.includes(`${card}:hover`)) {
        css += `\n${card}:hover { transform: translateY(-4px); box-shadow: var(--shadow-hover); }`;
    }
});

// Replace hardcoded box shadows that don't use var()
css = css.replace(/box-shadow:\s*(?!var)[^;]+;/g, 'box-shadow: var(--shadow-md);');
// Fix :hover box-shadows to use hover shadow
css = css.replace(/:hover\s*{[^}]*box-shadow:\s*var\(--shadow-md\);/g, match => match.replace('var(--shadow-md)', 'var(--shadow-hover)'));

// 4. Color System Chaos: Hex replacement
const hexMap = {
    '#ffffff': 'var(--bg-secondary)',
    '#fff': 'var(--bg-secondary)',
    '#000000': 'var(--text-main)',
    '#000': 'var(--text-main)',
    '#333333': 'var(--text-main)',
    '#333': 'var(--text-main)',
    '#666666': 'var(--text-secondary)',
    '#666': 'var(--text-secondary)',
    '#999999': 'var(--text-muted)',
    '#999': 'var(--text-muted)',
    '#dddddd': 'var(--border-color)',
    '#ddd': 'var(--border-color)',
    '#eeeeee': 'var(--bg-tertiary)',
    '#eee': 'var(--bg-tertiary)',
    '#f9f9f9': 'var(--bg-tertiary)',
    '#f5f5f5': 'var(--bg-tertiary)',
    '#4CAF50': 'var(--success)',
    '#f44336': 'var(--danger)',
    '#ff9800': 'var(--warning)',
    '#2196F3': 'var(--info)'
};

// We don't want to replace inside :root definitions
let sections = css.split(':root {');
if (sections.length > 1) {
    let nonRoot = sections[1].substring(sections[1].indexOf('}') + 1);
    
    // Replace hex in non-root
    for (const [hex, variable] of Object.entries(hexMap)) {
        const regex = new RegExp(hex + '(?=[;\\s,])', 'gi');
        nonRoot = nonRoot.replace(regex, variable);
    }
    
    // Reassemble
    css = sections[0] + ':root {' + sections[1].substring(0, sections[1].indexOf('}') + 1) + nonRoot;
}

// 5. Typography stabilization
// Replace absolute pixel fonts that are weird like 13px, 15px with standard rems or even pixel scales
css = css.replace(/font-size:\s*13px;/g, 'font-size: 0.875rem;'); // 14px
css = css.replace(/font-size:\s*15px;/g, 'font-size: 1rem;');    // 16px
css = css.replace(/font-size:\s*11px;/g, 'font-size: 0.75rem;'); // 12px

fs.writeFileSync(cssPath, css);
console.log('CSS upgraded successfully.');
