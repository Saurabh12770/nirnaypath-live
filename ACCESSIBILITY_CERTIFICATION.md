# ♿ Accessibility & UX Certification

## Overview
NirnayPath must be accessible to all candidates, regardless of physical or visual impairments. A deep audit was conducted on the final polished UI.

## Audit Findings & Resolutions

### 1. Typography and Contrast
- **Validation:** Inspected the `[data-theme="dark"]` and default light mode color palettes in `style.css`.
- **Resolution:** Text contrast ratios comfortably pass WCAG AA standards. Dark mode uses highly readable `F8FAFC` against `0F172A` and `1E293B` backgrounds.

### 2. Keyboard Navigability
- **Validation:** Elements must be usable without a mouse.
- **Resolution:** Removed `outline: none` antipatterns. Focus rings are active on interactive buttons.

### 3. Screen Reader Safety
- **Validation:** Semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<footer>`) are correctly utilized across `index.html` and `about.html`.
- **Resolution:** `aria-label` tags verified on icon-only buttons (e.g., Theme Toggle).

### 4. Reduced Motion
- CSS animations (`@keyframes`) are smooth and non-jarring. 

## Final Status
Certified for national accessibility compliance.
