# UNTHOUGHT — Brand × Product Spin Lab

> **Brands meet the unexpected.** A creative concept generator engineered for high-impact content and product innovation.

Live URL: **[https://unthought-spin-lab.vercel.app](https://unthought-spin-lab.vercel.app)**

---

## Overview

UNTHOUGHT is a single-page interactive web application engineered as a creative concept generator for the video series *Creating Products Brands Never Thought Of*.

It features two genuine, mathematically animated spin wheels:
- **Wheel 01 — Brands:** 20 world-class iconic brands
- **Wheel 02 — Products:** 40 diverse product categories

When the user triggers **SPIN BOTH ↗** (or hits <kbd>Space</kbd>), both wheels launch simultaneously, decelerate according to realistic physics, and stop independently on their winning selections to reveal an unexpected pairing (e.g., **FERRARI × TOOTHBRUSH**).

---

## Features

- **Genuine Angular Wheel Physics:** Real SVG segmented wheels where rotation angles are mathematically calculated before launch. The fixed top vermilion needle points directly at the winning segment center.
- **Natural Quintic Deceleration:** Physics-driven easing curve ($f(t) = 1 - (1-t)^5$) via `requestAnimationFrame`.
- **Web Audio API Mechanical Sound Engine:** Synthesizes realistic mechanical flapper clicks that scale pitch and volume with rotational velocity, ending with an authoritative stop clunk on each wheel.
- **Progressive Live Result Marquee:** Centered directly on top of the wheels for instant visual payoff during screen recording.
- **Art-Directed Studio Aesthetic:**
  - Background: Warm off-white (`#F5F4F0`)
  - Typography: Space Grotesk (display) + Inter (UI)
  - Wheels: Deep charcoal alternating sectors with hairline separators
  - Accent: Vivid Vermilion (`#F04427`)
- **800 Combinations:** Tracks history to avoid consecutive duplicate pairings.

---

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 6
- **Graphics:** SVG with dynamic polar transforms
- **Audio:** Web Audio API (zero external audio file dependencies)
- **Deployment:** Vercel

---

## Local Development

```bash
# Clone the repository
git clone <repo-url>
cd Spinwheel

# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build
```

---

## License

MIT © [UNTHOUGHT Studio](https://unthought-spin-lab.vercel.app)
