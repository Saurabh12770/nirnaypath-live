# GLOBALIZATION & MULTI-LANGUAGE ENGINE ARCHITECTURE

## Objective
Support a truly national ecosystem by enabling seamless switching between Hindi, English, and other regional languages while respecting RTL where applicable, without reloading the CBT interface.

## Architecture
1. **LocalizationEngine Service:** Backend service to manage translation bundles, loading JSON mappings dynamically.
2. **Context-Aware Translation:** Ensures specialized exam terms (e.g., "Aptitude", "Psychometric") remain culturally and contextually accurate.
3. **Accessibility Integration:** Ensures ARIA labels change dynamically when language switches.
4. **Caching:** Translation bundles are loaded at the edge via Redis to avoid DB hits on initial load.

## Supported Languages (Phase 17 Initial Rollout)
- `en`: English
- `hi`: Hindi
- Framework ready for `bn` (Bengali), `mr` (Marathi), `ta` (Tamil).
