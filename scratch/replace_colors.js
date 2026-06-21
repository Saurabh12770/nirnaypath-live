import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PAGES_DIR = path.resolve(__dirname, '../frontend/src/pages');

const files = [
  'LearnHub.jsx',
  'TestCenter.jsx',
  'Dashboard.jsx',
  'AdminPanel.jsx',
  'About.jsx',
  'LandingPage.jsx'
];

const replacements = [
  // Backgrounds
  { regex: /background:\s*['"]#050308['"]/g, replacement: "background: 'var(--color-bg-base)'" },
  { regex: /background:\s*['"]#06040b['"]/g, replacement: "background: 'var(--color-bg-base)'" },
  { regex: /background:\s*['"]#050309['"]/g, replacement: "background: 'var(--color-bg-base)'" },
  { regex: /background:\s*['"]#0b0f19['"]/g, replacement: "background: 'var(--color-primary-dark)'" },
  { regex: /background:\s*['"]rgba\(6,4,11,0.5\)['"]/g, replacement: "background: 'var(--color-card-bg)'" },
  
  // Text Colors
  { regex: /color:\s*['"]#cbd5e1['"]/g, replacement: "color: 'var(--color-text-base)'" },
  { regex: /color:\s*['"]#ffffff['"]/g, replacement: "color: 'var(--color-text-title-base)'" },
  { regex: /color:\s*['"]#e2e8f0['"]/g, replacement: "color: 'var(--color-text-title-base)'" },
  { regex: /color:\s*['"]#f8fafc['"]/g, replacement: "color: 'var(--color-text-title-base)'" },
  { regex: /color:\s*['"]#94a3b8['"]/g, replacement: "color: 'var(--color-text-muted-base)'" },
  { regex: /color:\s*['"]#64748b['"]/g, replacement: "color: 'var(--color-text-muted-base)'" },
  
  // Borders
  { regex: /border:\s*['"]1px solid rgba\(255,255,255,0\.03\)['"]/g, replacement: "border: '1px solid var(--color-border-base)'" },
  { regex: /border:\s*['"]1px solid rgba\(255,255,255,0\.04\)['"]/g, replacement: "border: '1px solid var(--color-border-base)'" },
  { regex: /border:\s*['"]1px solid rgba\(255,255,255,0\.05\)['"]/g, replacement: "border: '1px solid var(--color-border-base)'" },
  { regex: /border:\s*['"]1px solid rgba\(255,255,255,0\.06\)['"]/g, replacement: "border: '1px solid var(--color-border-base)'" },
  { regex: /border:\s*['"]1px solid rgba\(255,255,255,0\.08\)['"]/g, replacement: "border: '1px solid var(--color-border-base)'" },
  { regex: /border:\s*['"]1px solid rgba\(255,255,255,0\.1\)['"]/g, replacement: "border: '1px solid var(--color-border-base)'" },
  { regex: /borderBottom:\s*['"]1px solid rgba\(255,255,255,0\.06\)['"]/g, replacement: "borderBottom: '1px solid var(--color-border-base)'" },
  { regex: /borderBottom:\s*['"]1px solid rgba\(255,255,255,0\.05\)['"]/g, replacement: "borderBottom: '1px solid var(--color-border-base)'" },
  { regex: /borderBottom:\s*['"]1px solid rgba\(255,255,255,0\.04\)['"]/g, replacement: "borderBottom: '1px solid var(--color-border-base)'" }
];

function processFiles() {
  for (const file of files) {
    const filePath = path.join(PAGES_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping missing file: ${file}`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const r of replacements) {
      content = content.replace(r.regex, r.replacement);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Successfully updated theme variables in: ${file}`);
    } else {
      console.log(`No changes needed for: ${file}`);
    }
  }
}

processFiles();
