# Employee Evaluation System — Design Brainstorming

## Three Stylistic Approaches

### 1. Corporate Glassmorphism
**Theme Name:** Arctic Glass  
**Brief:** A premium enterprise feel with frosted glass panels over deep navy/slate gradients. Clean, authoritative, and modern — the kind of UI a Fortune 500 HR department would trust.  
**Probability:** 0.07

### 2. Warm Executive Dashboard
**Theme Name:** Amber Authority  
**Brief:** Rich warm tones — deep charcoal, amber gold, and cream — evoking boardroom gravitas. Inspired by luxury financial dashboards with strong typographic hierarchy.  
**Probability:** 0.03

### 3. Deep Space Command Center
**Theme Name:** Obsidian Command  
**Brief:** Dark, near-black backgrounds with vibrant indigo/violet accent lines and crisp white data. Feels like mission-critical software — precise, focused, and powerful.  
**Probability:** 0.02

---

## Selected Approach: Arctic Glass (Corporate Glassmorphism)

### Design Movement
**Corporate Glassmorphism** — Inspired by Apple's visionOS and Microsoft Fluent Design System, adapted for enterprise HR software. The aesthetic bridges the gap between luxury consumer apps and enterprise utility.

### Core Principles
1. **Depth through Glass:** Every card and panel uses `backdrop-filter: blur` with semi-transparent backgrounds to create a sense of layered depth.
2. **Data-First Clarity:** Typography and spacing always serve readability. No decoration that competes with data.
3. **Controlled Color:** A strict palette of deep navy (#0F172A), electric indigo (#6366F1), and clean white/slate. Accent colors are used sparingly and purposefully.
4. **Motion with Purpose:** Animations are subtle, physics-based, and never distracting — they confirm actions and guide attention.

### Color Philosophy
- **Background:** Deep navy-slate gradient (`#0F172A` → `#1E293B`) — creates the "glass over dark" effect
- **Glass Panels:** `rgba(255,255,255,0.06)` with `backdrop-blur-xl` — translucent without being distracting
- **Primary Accent:** Electric Indigo `oklch(0.6 0.22 264)` — modern, trustworthy, energetic
- **Success:** Emerald `oklch(0.7 0.18 162)` — approvals, positive metrics
- **Warning:** Amber `oklch(0.78 0.17 70)` — pending states
- **Danger:** Rose `oklch(0.65 0.22 15)` — rejections, deletions
- **Text:** Near-white `oklch(0.95 0.005 264)` on dark, deep slate `oklch(0.15 0.01 264)` on light

### Layout Paradigm
- **Persistent Left Sidebar** (admin): Fixed 260px sidebar with icon+label nav items, collapsible on mobile
- **Content Area:** Right-side main content with generous padding, no centered single-column layouts
- **Card Grid:** Asymmetric grid mixing wide stat cards with narrow action panels
- **Floating Action Zones:** Key actions (New Evaluation, etc.) float in the top-right of each section

### Signature Elements
1. **Glowing Borders:** Cards have a subtle `1px` border with `rgba(99,102,241,0.3)` — a faint indigo glow
2. **Gradient Stat Numbers:** Large metric numbers use an indigo-to-violet gradient text effect
3. **Status Badges:** Pill-shaped badges with glass backgrounds and colored left-border accents

### Interaction Philosophy
- Hover states reveal slightly brighter glass and a gentle upward `translateY(-2px)` lift
- Buttons scale to `0.97` on press with a 160ms ease-out
- Modals slide in from bottom on mobile, fade+scale from center on desktop
- Sidebar items have a left-border indicator that slides in on active state

### Animation
- **Entrance:** Cards stagger in with `opacity: 0 → 1` + `translateY(12px → 0)` at 30ms intervals
- **Transitions:** 180–250ms with `cubic-bezier(0.23, 1, 0.32, 1)` (snappy ease-out)
- **Loading:** Skeleton shimmer using gradient animation
- **Chart:** Recharts with animated draw-on-mount

### Typography System
- **Display/Headings:** `Sora` — geometric, modern, authoritative (Google Fonts)
- **Body/UI:** `Inter` — highly legible for data-dense interfaces
- **Monospace/Numbers:** `JetBrains Mono` — for ratings, IDs, timestamps
- **Hierarchy:** 
  - Page titles: `Sora 700, 28px`
  - Section headers: `Sora 600, 20px`
  - Card labels: `Inter 500, 13px uppercase tracking-wider`
  - Body: `Inter 400, 14px`
  - Metrics: `Sora 700, 36px` with gradient

### Brand Essence
**"The performance intelligence platform built for organizations that take people seriously."**  
Adjectives: **Precise · Trustworthy · Empowering**

### Brand Voice
- Headlines sound confident and direct: *"Every evaluation tells a story."* / *"Performance, measured with integrity."*
- CTAs are action-oriented: *"Start Evaluation"* / *"Review Submissions"*
- Microcopy is reassuring: *"Your identity is protected"* / *"Saved automatically"*
- Banned phrases: "Welcome to our website", "Get started today", "Click here"

### Wordmark & Logo
A stylized **diamond/rhombus** shape formed by four overlapping translucent squares — symbolizing evaluation criteria intersecting. Rendered in indigo gradient, no text, used as favicon and sidebar icon.

### Signature Brand Color
**Electric Indigo** `oklch(0.6 0.22 264)` — the unmistakable color of this platform.
