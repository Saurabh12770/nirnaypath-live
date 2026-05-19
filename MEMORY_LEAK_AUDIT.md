# 🧠 Memory Leak & Event Cleanup Audit

## Background
Prolonged usage of Single Page Applications (SPAs) or highly dynamic interfaces often leads to memory bloat. A forensic JavaScript audit was conducted to locate stale closures, detached DOM nodes, and orphaned event listeners.

## Identified Leaks & Resolutions

### 1. Infinite Carousel Interval Leak
**Location:** `public/script.js` -> `makeInfiniteSlider()`
**Threat Level:** HIGH
**Root Cause:** The slider initialized `setInterval(move, intervalTime)` but lacked a teardown mechanism. If initialized multiple times or if tabs went into deep sleep, CPU thrashing occurred.
**Fix Implemented:**
- Captured interval IDs in the DOM using `dataset.sliderInterval`.
- Enforced strict `clearInterval()` before attaching new intervals.
- Implemented the `Visibility API` to pause intervals when the browser tab is hidden, saving battery on mobile devices.

### 2. Event Listener Duplication
**Location:** `public/script.js` -> `makeInfiniteSlider()`
**Threat Level:** MEDIUM
**Root Cause:** Calling the slider generator repeatedly attached duplicated `resize`, `mouseenter`, and `mouseleave` listeners.
**Fix Implemented:**
- Implemented an idempotency flag (`track.dataset.eventsBound = "true"`) ensuring event listeners are attached strictly once.

## Final Status
DOM memory profiles remain flat. No orphaned intervals detected. The UI is certified jitter-free.
