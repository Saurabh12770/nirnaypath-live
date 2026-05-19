# Phase 16: AI Learning Companion Architecture

## Overview
The AI Learning Companion shifts NirnayPath from a pure assessment platform to an active learning environment. It uses psychometric data and past test performance to guide candidate study habits.

## Core Capabilities
1. **Personalized Revision Plans**: Generates adaptive study schedules based on exam dates and the candidate's historical weak areas.
2. **Weak-Topic Guidance**: Points candidates to specific remedial materials (videos, notes) on the Marketplace.
3. **Motivational Insights**: Provides psychologically safe encouragement based on micro-improvements.
4. **Burnout Risk Indicators**: Analyzes engagement patterns (e.g., 14-hour study days with dropping mock scores) to recommend breaks, preventing candidate fatigue.

## Ethical Boundaries
- **Explainable Outputs Only**: The AI must always state *why* it is recommending a topic (e.g., "Because you missed 4 out of 5 geometry questions yesterday").
- **Psychologically Safe**: Tone must be encouraging, never punitive.
- **No Manipulative Engagement**: The AI should not use FOMO or addictive gamification loops to force candidates to stay on the platform. If they need a break, the AI explicitly tells them to log off.

## Architecture
- **Service**: `AILearningCompanion.js`
- **Data Source**: Feeds off the telemetry and scoring engines implemented in Phase 11.
