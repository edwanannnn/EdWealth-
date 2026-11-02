---
name: FinFlow Dynamic Minimalist
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#414754'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#727785'
  outline-variant: '#c1c6d6'
  surface-tint: '#005bc0'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#006577'
  on-tertiary: '#ffffff'
  tertiary-container: '#008096'
  on-tertiary-container: '#f9fdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  currency-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system channels an optimistic, highly dependable, and intuitive approach to everyday personal finance tailored for mobile-first personal wealth management. It blends modern neo-banking clarity with vibrant tactile warmth, counteracting financial anxiety with friendly ergonomics, crisp content hierarchies, and clear feedback.

The aesthetic marries Modern Corporate reliability with refined tactile surfaces. Generous whitespace, pill-shaped interactions, crisp typography, and an energetic balance of vibrant blues and warm amber accents create an interface that feels both institutional in security and delightful in daily micro-interactions. Dynamic audio-reactive states—manifested through cyan-tinted light-emitting glows—bridge ambient voice expense tracking with high-utility visual reporting.

## Colors

The palette is engineered around clarity, balance, and quick cognitive processing under varying outdoor lighting conditions:

- **Primary (`#1877F2`)**: Deep energetic royal blue serving as the core structural hue, brand touchpoints, active states, and navigation anchors.
- **Secondary (`#F59E0B`)**: Radiant warm amber yellow reserved for primary floating action triggers (FAB), key financial milestones, quick-add transaction buttons, and focal highlights.
- **Tertiary (`#06B6D4`)**: Electric cyan deployed selectively for voice assistant waveforms, real-time auditory feedback, and smart budget insights.
- **Neutral (`#0F172A`)**: Deep slate foundation providing high-legibility typographic hierarchy against pure white (`#FFFFFF`) surfaces and ultra-soft blue-tinted canvas backdrops (`#F8FAFC` to `#F0F6FE`).

### Functional Status Tokens
- **Income / Surplus**: Emerald Green (`#10B981`) paired with a 10% tinted background container (`#ECFDF5`).
- **Expense / Outflow**: Vibrant Coral Red (`#EF4444`) paired with an alert background container (`#FEF2F2`).
- **Voice Glow Accent**: Dual-stop linear glow blending Primary (`#1877F2`) into Tertiary (`#06B6D4`) with 40% ambient diffusion.

## Typography

The typography uses Plus Jakarta Sans across all roles for its contemporary geometric balance, clear numeric figures, and legibility at compact mobile scale.

- **Numerics & Currencies**: All financial values (e.g., Rupiah formatted sums like `Rp 1.450.000`) use semi-bold to extra-bold weights with tight negative tracking (`-0.02em`) to maintain strong scanning affinity without line breaks.
- **Rhythm & Optical Hierarchy**: Display scales command account overview metrics and monthly balances. Body text stays strictly at regular (`400`) weight to prevent visual clutter in dense ledger lists, with medium/semi-bold (`600`) reserved for category names and merchant descriptors.

## Layout & Spacing

The layout is built on a mobile-first fluid grid standard, prioritizing handheld thumb-reach zones and horizontal space conservation:

- **Mobile Viewport (< 640px)**: 4 columns, `margin` of `1rem` (16px), and `gutter` of `1rem` (16px). Key actions and the primary FAB reside inside the bottom navigation deck within natural thumb arcs.
- **Tablet Viewport (640px - 1024px)**: 8 columns, `margin` of `2rem` (32px), `gutter` of `1.5rem` (24px). Analytical charts and recent transaction feeds split into an asymmetric two-pane layout.
- **Desktop / Wide Viewport (> 1024px)**: 12 columns, maximum content shell of `1200px` centered, `margin` of `3rem` (48px), and `gutter` of `2rem` (32px).

Internal component paddings adhere to strict multiples of 4px, where structural card containers default to `space-lg` (24px) on mobile and ledger lists use `space-sm` (8px) vertical gaps with `space-md` (16px) cell padding.

## Elevation & Depth

Visual hierarchy uses clean ambient light layering paired with targeted glowing states rather than harsh, dark outlines.

- **Level 0 (Flat Canvas)**: Pure white `#FFFFFF` or pale morning blue `#F8FAFC`.
- **Level 1 (Card & Module Shells)**: Surface `#FFFFFF` layered over the canvas, lifted with a soft ambient shadow: `0px 4px 20px -2px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Popovers, Bottom Sheets & Dropdowns)**: Surface `#FFFFFF` elevated with `0px 12px 32px -4px rgba(15, 23, 42, 0.08)` and a microscopic border `1px solid rgba(226, 232, 240, 0.8)`.
- **Level 3 (Action Anchor / Secondary FAB)**: Floating elements cast a tinted golden shadow: `0px 8px 24px -2px rgba(245, 158, 11, 0.35)`.
- **Level Voice (Audio Visualizer Overlay)**: Backdrop blur of `16px` using `rgba(15, 23, 42, 0.4)`. The audio visualizer waveform projects a radiant cyan/blue glow using `box-shadow: 0px 0px 24px 6px rgba(6, 182, 212, 0.45)`.

## Shapes

The interface embraces a pill-based shape profile (`roundedness: 3`), reinforcing friendliness, ergonomic thumb touch, and swift gesture responsiveness.

- **Buttons, Badges & Chips**: Fully pill-shaped (`border-radius: 9999px`) across all sizes, communicating frictionless clickability.
- **Cards & Data Modules**: Large rounded containers (`rounded-xl`, 24px to 32px), eliminating sharp visual barriers in dense financial displays.
- **Input Fields & Search Bars**: Pill-shaped or heavily rounded (`rounded-lg`, 16px to 20px) to match action button geometry.
- **Voice Visualizer Container**: Spherical and organic capsule contours that contract and expand dynamically in sync with audio frequency bands.

## Components

### Buttons
- **Primary Action (FAB / Add Transaction)**: Fully pill-shaped, vibrant warm amber yellow (`#F59E0B`) with high-contrast neutral slate text (`#0F172A`), casting an amber-tinted shadow.
- **Brand Primary Button**: Royal blue (`#1877F2`) fill with pure white label, `rounded-full`, height 48px or 52px, active scale transform (`scale(0.98)`).
- **Secondary / Ghost Button**: Translucent royal blue tint (`rgba(24, 119, 242, 0.08)`) with royal blue typography, borderless.

### Chips & Badges
- **Status Chips**: Pill-shaped with `0.25rem` vertical and `0.75rem` horizontal padding. Income chips use soft emerald backgrounds (`#ECFDF5`) with bold green text (`#059669`). Expense chips use soft coral backgrounds (`#FEF2F2`) with red text (`#DC2626`).
- **Filter Category Chips**: Inactive chips feature light gray-blue borders with slate labels; selected chips toggle to solid royal blue with white text.

### Cards & Financial Modules
- **Overview Wallet Card**: Gradient or pure solid royal blue surface, rounded to 24px, housing total balance, hidden balance toggle, and quick-action mini-pills. Text inside switches to white and 80% opacity soft blue.
- **Standard Transaction Card**: Pure white background, subtle ambient shadow, containing merchant circular avatar (44px), two-line title/timestamp hierarchy, and right-aligned amount in bold.

### Form Inputs
- **Text & Numeric Inputs**: Pill-shaped or soft-rounded (16px), background set to `#F8FAFC`, transitioning to `#FFFFFF` with a 2px royal blue outline and soft glow upon focus. Left-aligned Rupiah prefix (`Rp`) anchored in medium-weight slate.

### Selection Controls (Checkboxes & Radios)
- **Checkboxes**: Smooth rounded squares (6px radius), transitioning to royal blue fill with white checkmark when selected.
- **Radio Buttons**: Concentric pill rings, active center painted in solid royal blue.

### Voice Assistant Visualizer
- **Visualizer Pod**: Positioned as a floating bottom modal or full-screen overlay with glassmorphism backdrop blur (`rgba(15, 23, 42, 0.65)`).
- **Waveform Pillars**: A sequence of 5 to 7 rounded vertical pill bars animating to audio volume amplitudes, driven by a gradient from tertiary cyan (`#06B6D4`) to royal blue (`#1877F2`), projecting an outer glow aura (`rgba(6, 182, 212, 0.5)`).
- **Audio Transcript Preview**: Floating pill container displaying real-time transcribed text (e.g., *"Beli kopi Rp 25.000"*) with instant category auto-assignment badge.