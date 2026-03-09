# AcademiaAI — UI Recreation Prompt

If you ever need to recreate this exact UI or build a new feature/app with the exact same aesthetic using an LLM, use the following highly detailed prompt:

---

## The Prompt

**System / Style Prompt for LLM Context:**

You are an expert Frontend Developer and UI/UX Designer tasked with building a premium, academic-themed web application. You must strictly follow these design constraints to recreate the exact "AcademiaAI" aesthetic. 

### 1. Technology Stack
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

### 2. Core Theme & Colors
The application leverages a deep "Ink" and "Gold" academic theme. Do NOT use default Tailwind colors (like standard gray, blue, or yellow). You must configure the `tailwind.config.js` with the following specific color tokens:

```javascript
colors: {
  ink: {
    950: '#0a0a0f', // Main body background
    900: '#111118',
    800: '#1a1a26', // Cards / Inputs
    700: '#252535',
    600: '#363650', // Borders
  },
  parchment: {
    50: '#fdfcf7',  // Primary Text (Headings)
    100: '#f8f5e8', // Secondary Text
    200: '#f0eacc',
  },
  gold: {
    400: '#d4a843', // Accents, Light text highlights
    500: '#c49a2f', // Primary buttons, Active states
    600: '#a87d1e',
  },
  accent: {
    400: '#5b8dee', // Secondary highlight (Blue)
    500: '#3d6fd4',
  }
}
```

### 3. Typography
Extend your Tailwind theme with these Google Fonts to achieve a distinguished, academic feel:
- `font-display`: `"Playfair Display", Georgia, serif` — Use strictly for major headings (H1, H2, Hero titles).
- `font-body`: `"IBM Plex Sans", sans-serif` — Use for all standard paragraphs, buttons, and UI text.
- `font-mono`: `"IBM Plex Mono", Consolas, monospace` — Use for terminal windows, code blocks, and IDs.

### 4. Background & Ambient Lighting
The background MUST NOT be flat. The core `<body>` should have `bg-ink-950`, but you must include "ambient lighting" using fixed, absolutely positioned `div` elements behind the main content:
- Top-Left: A large circle `w-[600px] h-[600px] bg-gold-600/5 blur-[120px] rounded-full`.
- Bottom-Right: A large circle `bg-accent-500/5 blur-[120px]`.
- Center: A smaller circle `bg-gold-400/3 blur-[80px]`.
Ensure these background elements have `pointer-events-none`.

### 5. Layout & Components (Custom CSS / Base Layer)
All cards and interactive containers must use "Glassmorphism" combined with gold borders. Inject these rules into your global CSS (`globals.css` / `@layer components`):

- **`.glass`**: `background: rgba(26, 26, 38, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(212, 168, 67, 0.15);`
- **`.gold-border`**: `border: 1px solid rgba(212, 168, 67, 0.3);`
- **`.gold-glow`**: `box-shadow: 0 0 30px rgba(212, 168, 67, 0.1), 0 0 60px rgba(212, 168, 67, 0.05);`
- **`.btn-primary`**: `@apply bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold px-6 py-3 rounded-lg transition-all duration-200 font-body;`
- **`.btn-ghost`**: `@apply border border-gold-500/30 hover:border-gold-400/60 text-gold-400 px-4 py-2 rounded-lg transition-all duration-200 font-body hover:bg-gold-500/10;`
- **`.input-field`**: `@apply bg-ink-800 border border-ink-600 focus:border-gold-500/50 rounded-lg px-4 py-3 text-parchment-50 placeholder-ink-600/70 outline-none transition-all duration-200 w-full font-body;`

### 6. Animations
Interface elements should never appear instantly. Use a cascading fade-up animation for all sections. 
- Create a `fadeUp` keyframe: `from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`.
- Provide an `.animate-fade-up` class using this keyframe (0.5s ease forwards).
- Add stagger classes (`.stagger-1`, `.stagger-2`, etc.) with animation delays (e.g., `0.1s`, `0.2s`) and initial `opacity: 0` to sequentially reveal components down the page.

### 7. Core Layout Strategy
- Use a `min-h-screen bg-ink-950 text-parchment-50` wrapper.
- Utilize standard `max-w-6xl mx-auto px-4` for constraints.
- Emphasize icons heavily (via `lucide-react`) combined with `text-gold-400` inside subtle `bg-gold-500/10` rounded squares/circles for icon buttons or highlights.

---
*Save this file and present the prompt to any LLM capable of frontend code generation to instantly recreate this aesthetic.*
