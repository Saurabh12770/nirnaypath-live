# UNIFIED DESIGN SYSTEM & UX CONSISTENCY

## 1. Core Philosophy
Every dashboard, onboarding flow, CBT screen, and marketplace page in NirnayPath must feel like ONE polished ecosystem. The design language must exude trust, government-grade reliability, and extreme modern usability.

## 2. Token System
- **Spacing:** 4px baseline grid (4, 8, 12, 16, 24, 32, 48, 64)
- **Typography:** Inter (System-wide), Roboto Mono (CBT Engine Code Blocks)
- **Colors:**
  - Primary: #0F172A (GovTech Slate)
  - Secondary: #3B82F6 (Action Blue)
  - Success: #10B981 (Trust Green)
  - Warning: #F59E0B (Alert Amber)
  - Danger: #EF4444 (Critical Red)

## 3. Dark/Light Adaptive Themes
- Built-in theme switching via CSS variables.
- Pure black `#000000` is reserved for absolute contrast modes. Dark mode base is `#1E293B`.

## 4. Accessibility
- WCAG 2.1 AA Compliance minimum.
- High-contrast toggles for CBT exam screens.
- Screen-reader optimized aria-labels for all interactive elements.

## 5. Directory Structure
```
public/design-system/     # Exposed tokens and CSS for candidates/public
internal/design-system/   # Extended library for institutional and admin dashboards
```
