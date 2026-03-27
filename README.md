# BrandDrop — Kinetic Brand Identity Terminal

BrandDrop is a high-performance brand extraction and identity system generator. It takes a raw logo/asset as input and uses a kinetic neural processor (Gemini AI) to define consistent colors, typography, spatial systems, and visual rules for your brand in seconds.

## Features

- **Kinetic Asset Extraction:** Drop a file and see your core colors and mark identified instantly.
- **Neural Brand Personality:** AI identifies the tone, pulse, and energy of your brand (Minimal, Bold, Techy, etc.).
- **Typographic Hierarchy:** Recommendations for Headlines, Body, and Labels with live Google Font previews.
- **Color Architecture:** Primary, Accent, and Secondary palettes with generated tint shades.
- **Elevation & Spatial Profile:** Defined base units, spacing increments, and elevation surfaces (shadows/depth).
- **Automated Brand Blueprint:** Generates a full Markdown technical document you can copy into your workspace.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Intelligence:** Google Gemini AI (via `@google/generative-ai`)
- **Styling:** Tailwind CSS + Glassmorphism / Neon Dark Mode
- **Persistence:** Tab-based SessionStorage for zero-latency page transitions
- **Development:** TypeScript-first architecture

## Getting Started

### 1. Requirements

- Node.js 18+
- A Google AI Studio (Gemini) API Key

### 2. Environment Setup

Create a `.env.local` file at the root:

```bash
GOOGLE_AI_KEY=your_gemini_api_key_here
```

### 3. Installation

```bash
npm install
```

### 4. Launch Terminal

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to launch the terminal.

---
© 2024 BrandDrop Ecosystem. Kinetic Terminal Systems.

