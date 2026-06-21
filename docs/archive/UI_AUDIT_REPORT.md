# 🎨 NirnayPath 3.0 — UI/UX Audit Report

**Prepared by:** Senior UX Architect & FAANG Frontend Engineer  
**Date:** June 14, 2026  
**Status:** ⚠️ AUDIT COMPLETE (AESTHETIC UPGRADES COMMENCING)

---

## 1. Visual Aesthetics & Design Language

### Current Observations:
- **Dark-Only Dominance**: The system uses a beautiful dark purple/violet color scheme, but it is locked to a dark mode layout. The lack of a light mode theme limits readability in high-glare environments (e.g., outdoor study sessions).
- **Harmonious Accents**: Accents of vibrant orange, yellow, green, and sky blue are successfully defined in CSS but are underutilized in card structures, which feel uniform and lack visual energy.
- **Typography**: Inter (body text) and Outfit (headings) are loaded, but font-weights are occasionally inconsistent across page cards, leading to slight visual hierarchy confusion.

---

## 2. Page-by-Page Audit Details

### 2.1 Landing Page (`LandingPage.jsx`)
- **Stretched Hero Carousel**: The aspect ratio is locked to a `37.5%` padding-bottom on all screen widths. On desktop, this yields a stretched 16:6 aspect ratio. However, on mobile viewports, the content is severely compressed, squishing the text overlay and reducing CTA legibility.
- **Unused Assets**: The landing page carousel only cycles through 4 hero images, leaving 4 premium hero images (`home_hero5.jpg` to `home_hero8.jpg`) unused in the public assets directory.
- **Section Color Saturation**: The sections have a uniform dark slate background, making the page look "heavy" and lacking the vibrant, multi-colored premium appeal of PhysicsWallah or Unacademy.

### 2.2 About Page (`About.jsx`)
- **Under-sized Narrative**: The founder section contains a summary message (~250 words) that lacks emotional depth and detailed context regarding Saurabh Kumar's roots in Bihar and his engineering struggles.
- **Banner Carousel**: Similar to the landing page, it uses a fixed padding-bottom which stretches on wide viewports and squishes on mobile.

### 2.3 Learn Hub (`LearnHub.jsx`)
- **Hardcoded Colors**: Study notes containers have hardcoded backgrounds (`#050308`, `#06040b`) and text colors (`#cbd5e1`). Toggling a global light mode would result in unreadable gray text on gray backgrounds due to lack of theme-variable mapping.
- **Progress Bar Contrast**: The sticky progress bar works well, but lacks a visible background track, making it difficult to gauge how much content remains in the subtopic.

### 2.4 Test Center (`TestCenter.jsx`)
- **Console High-Contrast Modes**: When launching the full-screen mock test console, the question text and option lists are styled using absolute colors. Light mode will cause visibility failures without variable-based colors.
- **Warning Alert Box**: The error alerts triggered by "No questions found matching criteria" are simple browser alert popups, which break the premium product experience.

### 2.5 Analytics Dashboard (`Dashboard.jsx`)
- **SVG Color Scales**: Custom SVG progress rings and accuracy charts are hardcoded to dark mode colors. They need to adapt dynamically to a light base to remain readable on a light background.

---

## 3. Recommended Remediation & Execution Steps

1. **Global CSS Variables**: Map all hardcoded color references to CSS variables defined in `:root` and `:root[data-theme="light"]` in `index.css`.
2. **Global Context Integration**: Store the active theme state in the `AuthContext` and persist it via `localStorage`. Toggle the theme on the root document element.
3. **Navbar Toggles**: Add a theme switcher to `AppLayout` and `LandingPage` next to the language switcher.
4. **Responsive Carousel**: Update the carousel class to use mobile-first rules (16:9 on mobile, 16:6 on desktop) via media queries.
5. **Content Seed Upgrades**: Manually seed high-yield, comprehensive learning contents to serve as template examples for UPSC and BPSC modules.
