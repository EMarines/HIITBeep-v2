---
name: Frontend Guidelines
description: UI/UX design tokens, component rules, and consistency guidelines for the HIITBeep application.
---

# HIITBeep Frontend Skill

This document defines the strict UI and UX guidelines to follow when building or modifying components for HIITBeep.

## 1. Design System & CSS Variables

HIITBeep uses a custom CSS architecture defined in `src/app.css` that provides a **"Dark Mode Premium"** aesthetic. **DO NOT** hardcode colors. ALWAYS use these CSS variables.

**Core Backgrounds:**
* `--bg-app`: `#0b1120` (Main background)
* `--bg-card`: `#111827` (Base cards & modals)
* `--bg-card-alt`: `#1a2235` (Secondary elements)
* `--bg-input`: `#ffffff` (Form inputs)

**Accent Colors:**
* `--accent-green`: `#22c55e` (Primary action, Work periods)
* `--accent-orange`: `#f97316` 
* `--accent-yellow`: `#facc15` (Prep periods)
* `--accent-blue`: `#3b82f6` (Rest periods)
* `--accent-purple`: `#a855f7`
* `--accent-red`: `#ef4444` (Danger actions)

**Text:**
* `--text-primary`: `#ffffff`
* `--text-secondary`: `#94a3b8`
* `--text-muted`: `#4b5563`
* `--text-label`: `#64748b`
* `--text-input`: `#1e293b`

**Geometry:**
* `--radius-card`: `18px`
* `--radius-btn` & `--radius-input`: `12px`

## 2. Global Component Classes (The `hb-` namespace)

Instead of creating massive inline style blocks or new classes, prefer using the existing utility classes defined in `app.css`:

### Cards & Layout
* `.hb-card`: Base container for any widget or module.
* `.hb-card-{color}`: (e.g., `hb-card-green`) Adds a left border accent and a subtle glow. Use these to differentiate states or categories.
* `.hb-page-header`, `.hb-page-title`, `.hb-page-subtitle`: For standard page headers.
* `.hb-section-label`: For small, uppercase section headers.

### Buttons & Interactions
* `.hb-btn`: Base button.
* `.hb-btn-primary`: Big, green, glowing primary action.
* `.hb-btn-secondary`: Outlined dark button for secondary actions.
* `.hb-btn-icon`: 32x32px transparent button for icons.
* `.hb-fab`: 56x56px Floating Action Button.
* `.hb-back-btn`: Standard back arrow button.

### Form Inputs
* `.hb-input-group`, `.hb-label`, `.hb-input`, `.hb-select`: Standard form elements.

### Typographic Utility Classes
Note: We also have custom Tailwind-like utility classes available for text (`text-sm`, `font-bold`), layout (`flex`, `items-center`), and spacing (`p-4`, `mb-2`) located at the bottom of `app.css`. Prefer these over defining local `<style>` blocks when possible.

## 3. UX Rules for HIITBeep

Because this is a fitness interval timer application, users will interact with it while sweaty, tired, and moving.

1.  **Touch Targets:** All clickable elements (buttons, icons, menu items) MUST have adequate sizing and padding to be easily tappable mid-workout.
2.  **High Contrast:** Rely on the high contrast combinations available (e.g., `--accent-green` on `--bg-card` or `--bg-app`).
3.  **Visual Hierarchy:** The active timer or the most important action must *always* be the most prominent element on screen (typically utilizing `.hb-btn-primary` or bright accent colors). Color code different states consistently (Prep = Yellow, Work = Green, Rest = Blue).
4.  **Micro-animations:** Appreciate and leverage the built-in CSS transitions (e.g., `transform: translateY(-2px)` on cards, `scale(0.97)` on buttons) for immediate tactile feedback.

## 4. Component Structure (Svelte 5)

When creating or modifying `.svelte` components:
* Keep logic clean in `<script lang="ts">`.
* Use the defined global CSS classes (e.g., `hb-card`, `flex`, `mt-4`) inside the HTML `<template>`.
* **Only add a `<style>` block if you absolutely need highly specific, non-reusable layout rules**, and even then, make sure you use `var(--variable-name)` instead of hardcoded hex codes.
