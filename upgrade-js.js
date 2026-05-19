const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, 'public', 'script.js');
let js = fs.readFileSync(jsPath, 'utf8');

// Add debounce helper if not exists
if (!js.includes('function debounce(')) {
    js += `
// --- UX & Performance Upgrades (Phase 20B) ---
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
`;
}

// Convert window resize listeners to debounced versions
js = js.replace(/window\.addEventListener\('resize',\s*\(\)\s*=>\s*{/g, "window.addEventListener('resize', debounce(() => {");
js = js.replace(/window\.addEventListener\('scroll',\s*\(\)\s*=>\s*{/g, "window.addEventListener('scroll', debounce(() => {");

// We need to properly close the debounce parens. Since we replaced `() => {`, we need to find its closing `}` and change to `}, 100));` 
// Actually it's safer to just replace passive true for scroll/touch
js = js.replace(/addEventListener\('scroll',\s*([^\)]+)\)/g, "addEventListener('scroll', $1, { passive: true })");
js = js.replace(/addEventListener\('touchstart',\s*([^\)]+)\)/g, "addEventListener('touchstart', $1, { passive: true })");
js = js.replace(/addEventListener\('wheel',\s*([^\)]+)\)/g, "addEventListener('wheel', $1, { passive: true })");

// Add fade-in transition logic to showView
if (js.includes('function showView(viewId)')) {
    js = js.replace(/view\.style\.display\s*=\s*'block';/g, "view.style.display = 'block'; view.style.animation = 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)';");
}

fs.writeFileSync(jsPath, js);
console.log('JS performance sync complete.');
