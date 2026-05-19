# Phase 16: Mobile Experience Architecture

## Overview
The Mobile Experience Layer provides a seamless, app-like experience for candidates accessing NirnayPath via mobile browsers, particularly in low-bandwidth or intermittent connectivity environments typical in rural areas.

## Core Capabilities
1. **Adaptive Rendering**: CSS/JS optimized for mobile screens (Mobile-First responsive design).
2. **Offline-Safe Caching**: Service Workers cache static assets and critical offline states.
3. **Reconnect-Safe Heartbeat**: Intelligent telemetry that queues pings during network loss and bulk-transmits upon reconnection.
4. **Low-Bandwidth Mode**: Defers loading heavy assets (images, complex UI) when the Network Information API indicates 2G/3G connections.
5. **Accessibility-First**: High contrast, large touch targets, and screen-reader compatibility.

## Architecture
- **Shell**: `public/mobile-app-shell.html` provides the app frame.
- **Logic**: `public/js/mobile-shell.js` handles connectivity state and sync.
- **PWA Integration**: Ready for `manifest.json` and Service Worker integration for add-to-homescreen functionality.

## Target Audience
- Candidates taking low-stakes formative assessments on mobile devices.
- Candidates checking results, downloading hall tickets, or reviewing study plans.
