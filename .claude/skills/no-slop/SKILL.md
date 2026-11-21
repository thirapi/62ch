---
name: "no-slop"
description: "Escape AI-generated aesthetics in UI/frontend: specific typography, color palettes, layouts, and design rules that avoid the generic 'AI look'"
---

# No-Slop Skill

## When to activate
- Building any user-facing UI (web app, landing page, dashboard, component library)
- Claude is defaulting to generic design choices (purple gradients, Inter/Roboto, card-heavy layouts)
- You need the output to look designed, not generated
- Before starting any frontend task where visual quality matters

## When NOT to use
- Internal tools where aesthetics don't matter
- Data-heavy dashboards where density beats beauty
- When you have an existing design system — reference that instead
- When the brief explicitly asks for a minimal/corporate look

## Instructions

Paste this block into your session or project CLAUDE.md before any UI work:

```
DESIGN RULES — read before writing any UI code:

NEVER use:
- Font families: Inter, Roboto, Arial, system-ui, -apple-system as the primary display font
- Color schemes: purple/violet gradients on dark or white backgrounds
- Layout patterns: hero → features grid → pricing → CTA (the startup template)
- Components: floating cards with border-radius > 8px, generic icon + title + body trios
- Spacing: uniform padding everywhere, centered everything, no visual hierarchy
- Animations: fade-in-up on scroll for every element

ALWAYS:
- Choose a typeface that fits the brief's context (editorial → serif, fintech → geometric sans, brutalist → condensed)
- Define a specific palette of 2–3 colors with clear roles (not "pick a nice blue")
- Create visual hierarchy: one thing should be the most important on each screen
- Use asymmetry, tension, and intentional whitespace — not just padding
- Animations should have purpose: reveal, transition, feedback — not decoration

BEFORE building: describe the design direction in one sentence and name the primary typeface + accent color. Build only after I approve.
```

### Visual direction prompts

Instead of "make a landing page", specify a direction:

**Editorial / magazine:**
```
Design direction: long-form editorial. Serif display (Fraunces or Playfair), 
cream background (#F8F4EE), black text, thin rules, generous leading, 
no cards — just typographic hierarchy.
```

**Brutalist / neo-brutalism:**
```
Design direction: neo-brutalism. Black borders, box shadows as offsets (4px 4px 0 black),
flat colors (orange #F97316 or yellow #FACC15), bold sans, no border-radius.
```

**Fintech / enterprise:**
```
Design direction: fintech dashboard. Dark theme (#0F1117), green accent (#22C55E),
monospace for numbers (JetBrains Mono), tight spacing, data-dense, no decorative elements.
```

**Minimal / Swiss:**
```
Design direction: Swiss International Style. Grid-based, Helvetica or Neue Haas Grotesk,
red (#E63946) single accent on white, flush-left alignment, no gradients, no shadows.
```

**Artisan / boutique:**
```
Design direction: boutique/artisan. Warm cream (#FAF7F2), terracotta (#C07850) accent,
serif for headings (Cormorant Garant), lots of whitespace, photography-first layout.
```

### What to do when Claude defaults to slop

If Claude produces:
- Cards with `rounded-xl shadow-lg` everywhere
- An Inter-based design with a blue primary color
- A hero + 3-column features grid + pricing table
- Tailwind's default gray palette

**Reset prompt:**
```
This looks like every other AI-generated site. Restart the design:
1. Propose 3 distinct visual directions as: [typeface / background / accent / one-line vibe]
2. Don't build anything yet — I'll pick one direction first
```

### Component-level rules

**Typography:**
```css
/* Use a real type scale, not Tailwind's defaults */
--step--1: clamp(0.8rem, 0.17vw + 0.76rem, 0.89rem);
--step-0:  clamp(1rem, 0.34vw + 0.91rem, 1.19rem);
--step-1:  clamp(1.25rem, 0.61vw + 1.1rem, 1.58rem);
--step-2:  clamp(1.56rem, 1vw + 1.31rem, 2.11rem);
--step-3:  clamp(1.95rem, 1.56vw + 1.56rem, 2.81rem);

/* One display face, one body face — not the same */
font-family: 'Fraunces', serif;       /* headings */
font-family: 'DM Sans', sans-serif;   /* body */
```

**Color:**
```css
/* Name your colors by role, not value */
--color-surface: #1A1A2E;      /* page background */
--color-text: #E8E8E8;         /* primary text */
--color-accent: #E94560;       /* CTAs, highlights */
--color-muted: #4A4A6A;        /* secondary text, borders */
/* No "primary", "secondary", "gray-500" — those are defaults */
```

**Layout:**
```css
/* Break the center-everything habit */
.hero {
  display: grid;
  grid-template-columns: 1fr 2fr;  /* intentional asymmetry */
  align-items: end;                 /* bottom-aligned, not centered */
}
```

## Example

**Bad (slop) prompt result:**
```tsx
// Inter, rounded cards, purple gradient, centered layout, fade-in-up animations
<div className="min-h-screen bg-gradient-to-b from-purple-900 to-black">
  <div className="max-w-6xl mx-auto px-4 py-20 text-center">
    <h1 className="text-5xl font-bold text-white mb-6">Your AI Platform</h1>
    <div className="grid grid-cols-3 gap-6 mt-16">
      <div className="bg-white/10 rounded-xl p-6 backdrop-blur">
```

**Good (with no-slop rules) prompt + result:**
```
Direction: fintech, dark, data-dense, monospace numbers, green accent
```
```tsx
// JetBrains Mono for numbers, Inter for labels, dark #0F1117, green #22C55E
<div className="min-h-screen bg-[#0F1117] text-[#E8E8E8] font-sans">
  <header className="border-b border-[#1E2030] px-6 py-3 flex items-center justify-between">
    <span className="text-sm font-medium tracking-widest uppercase text-[#6B7280]">Portfolio</span>
    <span className="font-mono text-[#22C55E] text-xl">$48,291.06</span>
  </header>
  <main className="grid grid-cols-[240px_1fr] h-[calc(100vh-49px)]">
```

---
