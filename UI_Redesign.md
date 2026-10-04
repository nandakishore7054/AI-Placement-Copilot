# AI Placement Copilot — Production UI/UX Redesign Plan

> **Status:** Plan only — awaiting user approval before implementation.  
> **Goal:** Transform the current functional prototype into a polished, cohesive, premium SaaS product.

---

## Table of Contents
1. [Current State Assessment](#1-current-state-assessment)
2. [Target Design Direction](#2-target-design-direction)
3. [Global Design System](#3-global-design-system)
4. [App Shell & Navigation](#4-app-shell--navigation)
5. [Component Library Strategy](#5-component-library-strategy)
6. [Page-by-Page Redesign Plan](#6-page-by-page-redesign-plan)
7. [Loading, Empty & Error States](#7-loading-empty--error-states)
8. [Charts & Data Visualization](#8-charts--data-visualization)
9. [Dark/Light Mode](#9-darklight-mode)
10. [Animations & Micro-interactions](#10-animations--micro-interactions)
11. [Responsive Design](#11-responsive-design)
12. [Accessibility](#12-accessibility)
13. [Library Integration Strategy](#13-library-integration-strategy)
14. [Implementation Phases](#14-implementation-phases)
15. [Files to Change](#15-files-to-change)
16. [Risks & Mitigations](#16-risks--mitigations)

---

## 1. Current State Assessment

### What Exists Today

| Layer | Status | Notes |
|-------|--------|-------|
| **Design Tokens** | ✅ Solid | OKLCH color system, Tailwind v4 `@theme`, card shadows, typography scale |
| **UI Primitives** | ⚠️ Incomplete | Only 8 shadcn components installed (`alert`, `avatar`, `badge`, `dialog`, `dropdown-menu`, `select`, `separator`, `textarea`). Missing: `Button`, `Card`, `Input`, `Label`, `Tabs`, `Tooltip`, `Sheet`, `Skeleton`, `Progress`, `Command`, `Popover`, `Table` |
| **App Shell** | ⚠️ Inconsistent | 3 separate sticky headers (student=indigo, recruiter=violet, admin=red). No sidebar. Mobile nav is horizontal scroll overflow bar |
| **Component Architecture** | ⚠️ Scattered | Buttons, inputs, cards are inline Tailwind in every page. No reusable `Button`, `Input`, `Card` primitives. Each page re-invents styling |
| **Responsive Design** | ⚠️ Basic | Grid cols change at breakpoints. Mobile nav is overflow scroll. No bottom tab bar for mobile. Tables convert to cards on mobile |
| **Dark Mode** | ❌ Not active | Token overrides exist in `.dark {}` CSS block but no toggle mechanism. `:root { color-scheme: light }` is hardcoded. `suppressHydrationWarning` is on `<html>` but no theme provider |
| **Loading States** | ⚠️ Partial | Skeleton loading for 4/12 routes (`jobs`, `applications`, `experiences`, `resume`). Rest have no loading.tsx |
| **Empty States** | ✅ Good | Most list views have contextual empty states |
| **Error States** | ⚠️ Partial | 3 error.tsx files exist. Sentry integration done. No per-section graceful degradation |
| **Animations** | ⚠️ Minimal | `tw-animate-css` imported. 2 custom keyframes (fadeIn, slideUp). No entrance animations, page transitions, or staggered reveals |
| **Charts** | ⚠️ Custom SVG only | One hand-coded SVG radar chart for skill gap. No charting library. No other visualizations |
| **Accessibility** | ⚠️ Partial | Radix primitives provide ARIA. Custom components lack `aria-label`, `role` attributes. No skip-to-content. No focus trap on custom modals |
| **Forms** | ✅ Functional | react-hook-form + Zod validation. But raw `<input>` and `<select>` everywhere instead of themed primitives |

### Top 10 Design Problems

| # | Problem | Impact |
|---|---------|--------|
| 1 | **No shared `Button` component** — 50+ inline button styles across pages with inconsistent sizing, colors, borders, and hover effects | Fragmented visual identity |
| 2 | **No shared `Input`/`Label` component** — Raw `<input>` elements with per-page styling | Inconsistent form UX |
| 3 | **No shared `Card` component** — `rounded-2xl border bg-card p-5` repeated with slight variations everywhere | Maintenance nightmare |
| 4 | **Header-only navigation** — Desktop shows 8 text links in a row; mobile shows a scrolling overflow bar with no active state indicator | Poor discoverability, no visual hierarchy |
| 5 | **Landing page feels detached** — Dark gradient glassmorphism landing vs. white/light dashboard creates jarring transition | Broken design continuity |
| 6 | **No dark mode toggle** — CSS tokens exist but no runtime switching mechanism | Missing expected feature |
| 7 | **No data visualization library** — Dashboards show number cards only, no trends/charts | Missed opportunity for at-a-glance insights |
| 8 | **Typography inconsistency** — Mix of `text-2xl font-bold`, `text-2xl font-black`, `text-lg font-bold`, `text-base font-semibold` for same semantic level across pages | Visual noise |
| 9 | **Badge/pill color explosion** — ~15+ inline color variants (`bg-indigo-50 text-indigo-700`, `bg-emerald-50 text-emerald-700`, etc.) defined per-component instead of centrally | Hard to maintain consistency |
| 10 | **No page entrance animations** — Content pops in statically; no staggered fade/slide transitions | Feels like a prototype, not a product |

---

## 2. Target Design Direction

### Design Philosophy
**"Calm SaaS"** — Clean white/neutral surfaces, subtle borders, generous whitespace, refined typography, purposeful color accents, and smooth micro-interactions. Think Linear, Vercel, Raycast, or the Libraries.dev aesthetic.

### Key Principles

1. **Systematic** — Every visual decision flows from the design token system
2. **Spacious** — More breathing room; cards have `p-6` minimum, section gaps are `space-y-8` or wider
3. **Restrained Color** — Primary indigo for CTAs only; neutral grays for 90% of surfaces; semantic colors for status only
4. **Elevated Typography** — Clear hierarchy with distinct heading/body/caption weights
5. **Purposeful Motion** — Every animation communicates meaning (entrance, feedback, transition)
6. **Mobile-First** — Bottom tab navigation, touch-friendly targets, progressive disclosure

---

## 3. Global Design System

### 3.1 Color Tokens (Refine existing `@theme`)

Current tokens are well-structured. Refinements needed:

```
Existing ✅ Keep:
  --color-primary: oklch(58% 0.19 270)        → Indigo (brand)
  --color-background: oklch(100% 0 0)         → Pure white
  --color-foreground: oklch(9% 0.02 260)      → Near-black
  --color-muted: oklch(96% 0.005 260)         → Light gray
  --color-border: oklch(90% 0.005 260)        → Subtle border

New tokens to ADD:
  --color-success: oklch(65% 0.18 155)        → Emerald green (accepted, completed)
  --color-warning: oklch(75% 0.15 85)         → Amber (review, caution)
  --color-info: oklch(65% 0.15 240)           → Blue (informational)
  --color-surface-raised: oklch(99% 0.002 260) → Slightly raised card bg (vs pure white)
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)
```

### 3.2 Typography Scale

Replace the current `h1`-`h4` base-layer with a more refined system:

```
Page Title:    text-2xl font-bold tracking-tight (28px)
Section Title: text-lg font-semibold (18px)
Card Title:    text-base font-semibold (16px)
Body:          text-sm (14px) — default
Caption:       text-xs text-muted-foreground (12px)
Eyebrow:       text-[11px] font-semibold uppercase tracking-wider
Stat Number:   text-3xl font-bold tabular-nums (30px)
```

### 3.3 Spacing System

Standardize spacing tokens to a consistent rhythm:

```
Section gap:       gap-8 (32px)
Card padding:      p-6 (24px)
Card inner gap:    space-y-4 (16px)
Component gap:     gap-4 (16px)
Dense element gap: gap-2 (8px)
Icon gap:          gap-2 (8px)
```

### 3.4 Border Radius

Current system is good. Enforce:

```
Cards/Panels:   rounded-xl (12px)
Buttons:        rounded-lg (8px)
Badges/Pills:   rounded-full
Inputs:         rounded-lg (8px)
Avatars:        rounded-full (circle)
Logo marks:     rounded-xl
```

### 3.5 Shadows

Standardize card shadow usage:

```
Default card:   shadow-sm    (subtle, always-on)
Hover card:     shadow-md    (elevated on hover)
Modal/Sheet:    shadow-lg    (prominent overlay)
Floating:       shadow-xl    (dropdowns, popovers)
```

---

## 4. App Shell & Navigation

### 4.1 Current Problems

- **3 separate inline header layouts** duplicated across student/recruiter/admin layouts
- **No sidebar** — all nav is in a horizontal top bar which gets crowded with 8+ links
- **Mobile nav** is a horizontally scrollable `<div>` with no active state highlighting
- **No breadcrumbs** for deep routes like `/interviews/[id]/feedback`
- **Logo is different** across portals (indigo "AI" vs violet "R" vs red "A")

### 4.2 Proposed Architecture

```
┌─────────────────────────────────────────────────┐
│ Top Header Bar (64px)                           │
│ ┌──────────┐                    ┌──────────────┐│
│ │ Logo     │                    │ Search|Theme|U││
│ └──────────┘                    └──────────────┘│
├─────────┬───────────────────────────────────────┤
│ Sidebar │ Main Content Area                     │
│ (240px) │ ┌─────────────────────────────────┐   │
│ ┌─────┐ │ │ Page Header + Breadcrumbs       │   │
│ │ Nav │ │ ├─────────────────────────────────┤   │
│ │Items│ │ │                                 │   │
│ │     │ │ │ Page Content                    │   │
│ │     │ │ │                                 │   │
│ └─────┘ │ └─────────────────────────────────┘   │
└─────────┴───────────────────────────────────────┘
```

#### Desktop (≥1024px)
- **Collapsible sidebar** (240px expanded, 64px collapsed — icon-only)
- Sidebar sections: Navigation links with icons, portal switcher (if admin/recruiter), user profile section
- Top bar: Logo + breadcrumbs on left, global search + dark mode toggle + `UserButton` on right
- Sidebar stores collapsed state in localStorage

#### Tablet (768px–1023px)
- **Sidebar collapsed by default** (icon-only, 64px)
- Expand on hover or hamburger tap (overlay mode)

#### Mobile (<768px)
- **No sidebar** — replaced by:
  - **Top header**: Logo + hamburger menu + UserButton
  - **Bottom tab bar**: 5 primary nav items with icons (Dashboard, Jobs, Applications, Interviews, More)
  - **"More" tab**: Opens a bottom sheet with remaining nav (Resume, Skill Gap, Career, Profile, etc.)

#### Implementation

| Component | File | Purpose |
|-----------|------|---------|
| `AppSidebar` | `src/components/layout/app-sidebar.tsx` | Collapsible sidebar with nav items, portal awareness |
| `AppHeader` | `src/components/layout/app-header.tsx` | Top bar with breadcrumbs, search, theme toggle, user |
| `MobileBottomNav` | `src/components/layout/mobile-bottom-nav.tsx` | Fixed bottom tab bar for mobile |
| `MobileNavSheet` | `src/components/layout/mobile-nav-sheet.tsx` | "More" bottom sheet overlay |
| `BreadcrumbNav` | `src/components/layout/breadcrumb-nav.tsx` | Auto-generated breadcrumbs from pathname |
| `ThemeToggle` | `src/components/layout/theme-toggle.tsx` | Light/dark/system mode switcher |
| `PortalSwitcher` | `src/components/layout/portal-switcher.tsx` | Switch between student/recruiter/admin |

### 4.3 Sidebar Navigation Structure

**Student Portal:**
```
Dashboard        (LayoutDashboard)
Jobs             (Briefcase)
Applications     (FileText)
Interviews       (Mic)
Resume           (FileSearch)
─── separator ───
Skill Gap        (Target)
Career           (Compass)
Experiences      (BookOpen)
─── separator ───
Profile          (UserCircle)
```

**Recruiter Portal:**
```
Dashboard        (LayoutDashboard)
Job Listings     (Briefcase)
Applicants       (Users)
Experiences      (BookOpen)
─── separator ───
Company          (Building2)
Team             (UserPlus)
```

**Admin Portal:**
```
Overview         (LayoutDashboard)
Audit Log        (Activity)
```

---

## 5. Component Library Strategy

### 5.1 Missing shadcn/ui Primitives to Install

```bash
npx shadcn@latest add button card input label tabs tooltip sheet skeleton progress table popover command scroll-area switch
```

This adds 15 new primitives to `src/components/ui/`. These replace all inline button/input/card patterns across the codebase.

### 5.2 Custom Shared Components to Build

| Component | File | Purpose |
|-----------|------|---------|
| `StatCard` | `src/components/shared/stat-card.tsx` | Unified stat/metric card used across all 3 dashboards |
| `PageHeader` | `src/components/shared/page-header.tsx` | Page title + description + optional actions slot |
| `EmptyState` | `src/components/shared/empty-state.tsx` | Reusable empty state with icon, title, description, action |
| `StatusBadge` | `src/components/shared/status-badge.tsx` | Centralized badge system for all status types |
| `DataTable` | `src/components/shared/data-table.tsx` | Reusable data table with sorting, filtering, pagination |
| `SearchInput` | `src/components/shared/search-input.tsx` | Debounced search with clear button |
| `FilterBar` | `src/components/shared/filter-bar.tsx` | Composable filter chips/dropdowns |
| `MetricChart` | `src/components/shared/metric-chart.tsx` | Small line/bar sparkline for dashboard trends |
| `ConfirmDialog` | `src/components/shared/confirm-dialog.tsx` | Reusable confirmation modal (replaces 3 duplicate patterns) |
| `SectionCard` | `src/components/shared/section-card.tsx` | Card wrapper with title, description, optional header action |

### 5.3 Existing Components to Refactor

| Current Component | Change |
|-------------------|--------|
| All inline `<button className="...">` | → Use `<Button>` from shadcn |
| All inline `<input className="...">` | → Use `<Input>` from shadcn |
| All `<div className="rounded-2xl border bg-card p-5">` | → Use `<Card>` from shadcn |
| `JobCard` inline button styles | → Use `<Button variant="ghost" size="sm">` |
| `ApplicationCard` inline styles | → Use `<Card>`, `<Badge>` |
| Per-page `StatCard` / `AnalyticsCard` / `QuickAction` | → Unify into shared `StatCard` |
| Per-page status badge functions (`getApplicationStatusBadge`, etc.) | → Centralize in `StatusBadge` |
| Per-page empty state components | → Centralize in `EmptyState` |
| `WithdrawApplicationDialog`, `DeleteJobDialog`, `DeleteResumeDialog`, `DeleteExperienceDialog` | → Share `ConfirmDialog` base |

---

## 6. Page-by-Page Redesign Plan

### 6.1 Landing Page (`src/app/page.tsx`)

**Current:** Dark gradient background, glassmorphism feature cards, emoji icons, basic CTA buttons.

**Redesign:**
- Keep the dark gradient hero — it's effective for first impression
- Replace emoji icons (🔍, 🎙️, etc.) with animated Lucide icon cards with gradient overlays
- Add social proof section: user count, companies, interviews conducted
- Add testimonial/logo carousel section
- Add pricing/plan comparison (even if free) for credibility
- Improve the CTA hierarchy: primary "Get Started" → secondary "Watch Demo"
- Add subtle entry animations (staggered fade-up) for feature cards
- Email subscription card in footer area
- Responsive: Stack to single-column on mobile

### 6.2 Auth Pages (`src/app/(auth)/sign-in`, `sign-up`)

**Current:** Dark gradient centered card. Clerk components render their own styles.

**Redesign:**
- Keep centered dark layout — it works
- Add animated gradient orbs or subtle particle background
- Add feature highlights alongside the auth card (split layout on desktop)
- Ensure Clerk theme customization matches our design tokens (Clerk `appearance` prop)

### 6.3 Onboarding Pages

**Current:** Functional multi-step forms.

**Redesign:**
- Add step progress indicator (1 → 2 → 3) at the top
- Use Card wrapper for form sections
- Add contextual illustrations/icons per step
- Transition animation between steps

### 6.4 Student Dashboard

**Current:** `(student)/dashboard/page.tsx` — Not found (redirects to jobs or has a separate routing). The student layout starts at `/dashboard`.

**Redesign:**
- Create a proper dashboard hub with:
  - Welcome header with user name and time-of-day greeting
  - 4 stat cards: Applications count, Interview score avg, Resume ATS score, Skill gap match %
  - Recent applications timeline (last 5)
  - Recommended jobs carousel (semantic matches)
  - Upcoming interviews card
  - Email subscription widget
  - Career progress ring (roadmap completion %)

### 6.5 Student Jobs Page

**Current:** Clean grid layout with filters. Good structure.

**Redesign:**
- Replace raw `<select>` dropdowns with shadcn `Select` or `Popover` filter chips
- Add a search command palette trigger (⌘K)
- Improve card hover: subtle border glow, card lift
- Add "Save job" bookmark button to card
- Grid → show 2 cols on tablet, 3 on desktop
- Improve pagination: add "Showing X–Y of Z" text

### 6.6 Student Applications Page

**Current:** Client-side search/filter with card grid. Well-structured.

**Redesign:**
- Replace search bar with `SearchInput` shared component
- Replace tab pills with shadcn `Tabs` component
- Add timeline view toggle (grid vs. timeline)
- Card redesign: clearer status progression visualization

### 6.7 Student Interviews Page

**Current:** Stats row + card grid. Good structure.

**Redesign:**
- Stat cards → use shared `StatCard` with mini sparkline trends
- Interview card → add progress indicator, clearer status colors
- Interview room (`InterviewAgent`) → dark mode interview room with larger audio visualizer, floating transcript
- Feedback view → add printable summary, shareable report link

### 6.8 Student Resume Page

**Current:** Upload zone + analysis cards. Well-designed.

**Redesign:**
- Score breakdown → animated circular progress rings instead of plain numbers
- Add comparative benchmark ("You vs. Average" bars)
- Keywords section → use pill cloud with color coding (found=green, missing=red)
- PDF viewer → inline embedded viewer frame

### 6.9 Career & Skill Gap Pages

**Current:** Complex, feature-rich. Roadmap view with milestone toggles. Radar chart.

**Redesign:**
- Radar chart → consider a more readable horizontal bar chart alternative alongside radar
- Roadmap milestones → add subtle connecting line art between steps
- Recommendations → card carousel with swipe on mobile
- Market insights → card layout with trend indicators (↑↓)

### 6.10 Recruiter Dashboard

**Current:** Stat cards, quick actions grid, company memberships, recent applications table.

**Redesign:**
- Replace all inline `StatCard`/`QuickAction` with shared components
- Add application funnel chart (Applied → Reviewed → Shortlisted → Interview → Offered)
- Add heatmap or bar chart: applications per job
- Company cards → better visual with logo integration

### 6.11 Recruiter Applicants Page

**Current:** Dual view (table/cards), search, job filter, status tabs. Solid.

**Redesign:**
- Replace with `DataTable` shared component
- Add bulk status update actions
- Add candidate comparison view

### 6.12 Admin Dashboard

**Current:** Analytics grid, user role distribution, job moderation table, audit trail.

**Redesign:**
- Add overview charts: daily signups trend, application volume trend
- Job moderation → better toggle UI with confirmation
- Audit trail → compact timeline format
- Add system health indicators

### 6.13 Admin Audit Log Page

**Current:** Filter bar + paginated table. Functional.

**Redesign:**
- Replace with `DataTable` shared component
- Add date range picker
- Add export CSV/JSON button
- Add detail expansion panel per row

---

## 7. Loading, Empty & Error States

### Loading States

**Current:** 4/12 routes have skeleton `loading.tsx`. Skeletons are basic pulse blocks.

**Plan:**
- Add `loading.tsx` to ALL route segments (12+ files)
- Standardize skeleton patterns using shadcn `Skeleton` component
- Match actual page layout in skeletons (not generic blocks)
- Add shimmer animation (gradient sweep) instead of plain pulse

### Empty States

**Current:** Inline per-page. Good messaging but inconsistent styling.

**Plan:**
- Create shared `EmptyState` component with props:
  - `icon` (Lucide icon)
  - `title` (string)
  - `description` (string)
  - `action` (optional Button)
- Replace all 10+ inline empty states

### Error States

**Current:** 3 error.tsx files. Basic "Something went wrong" messages.

**Plan:**
- Redesign error boundaries with branded illustration
- Add "Retry" button that resets the error boundary
- Add error code display for debugging
- Per-section error boundaries via Suspense + ErrorBoundary wrapping

---

## 8. Charts & Data Visualization

### Current State
Only one hand-coded SVG radar chart (`SkillGapChart`). No charting library.

### Recommendation

> [!IMPORTANT]
> **Awaiting user decision**: Which charting library to use? Options:
> - **Recharts** — Most popular, good shadcn integration via `shadcn/charts`
> - **Tremor** — Purpose-built for dashboards, minimal config
> - **Chart.js via react-chartjs-2** — Lightweight, flexible
> - **Custom SVG** — Keep hand-coding (current approach)

### Charts to Add

| Dashboard | Chart | Type |
|-----------|-------|------|
| Student | Applications by status | Donut/Ring |
| Student | ATS score trend (if re-analyzed) | Line |
| Student | Skill gap progress | Horizontal bar |
| Recruiter | Application funnel | Funnel/Stacked bar |
| Recruiter | Applications per job | Bar |
| Recruiter | Applications over time | Area/Line |
| Admin | Daily signups | Area |
| Admin | User role distribution | Donut |
| Admin | Application volume | Bar |

---

## 9. Dark/Light Mode

### Current State
- CSS tokens for `.dark` mode exist in `globals.css`
- No toggle UI
- No theme provider
- `:root { color-scheme: light }` hardcoded

### Implementation Plan

1. **Install `next-themes`** (lightweight, SSR-safe)
2. **Create `ThemeProvider`** wrapper component
3. Add provider inside root layout, wrapping `{children}`
4. **Create `ThemeToggle`** button component (sun/moon/monitor icons)
5. Place toggle in the app header
6. Update `<html>` tag: remove hardcoded `light`, let `next-themes` manage class
7. Verify all components render correctly in dark mode
8. Landing page: keep always-dark (force dark class on that page)

---

## 10. Animations & Micro-interactions

### Current State
- `tw-animate-css` imported but barely used
- 2 custom keyframes (`fadeIn`, `slideUp`)
- Radix dialog has open/close animations
- Cards have `hover:shadow-md hover:border-indigo-200 transition-all`

### Enhancement Plan

| Pattern | Implementation | Where |
|---------|---------------|-------|
| **Page entrance** | Staggered fade-up for card grids | All list pages |
| **Card hover** | Subtle lift (translateY -2px) + border color shift + shadow elevation | All cards |
| **Button press** | Scale down to 0.97 on active | All buttons |
| **Tab switch** | Sliding active indicator | All tab components |
| **Sidebar expand/collapse** | Width transition 240px ↔ 64px | Sidebar |
| **Modal enter/exit** | Backdrop fade + content slide-up | All dialogs |
| **Toast enter** | Slide in from right | Sonner (already configured) |
| **Stat counter** | Count-up animation on mount | Dashboard stat cards |
| **Progress bars** | Width transition on mount | Skill scores, ATS scores |
| **Skeleton shimmer** | Gradient sweep animation | All loading states |

### CSS Additions to `globals.css`

```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes countUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

---

## 11. Responsive Design

### Current Breakpoint Usage

```
sm (640px):  Grid column changes, padding adjustments
md (768px):  Desktop nav shown, mobile nav hidden
lg (1024px): 3-column grids, table views
xl (1280px): Wider grids
```

### Proposed Improvements

| Area | Current | Proposed |
|------|---------|----------|
| **Mobile navigation** | Horizontal scroll overflow bar | Fixed bottom tab bar (5 items + "More" sheet) |
| **Sidebar** | None | Desktop: 240px sidebar. Tablet: icon-only 64px. Mobile: hidden (use bottom nav) |
| **Dashboard grids** | 1→2→4 cols | 1→2→3 cols with consistent card heights |
| **Data tables** | Desktop: table / Mobile: card grid | Shared `DataTable` with responsive mode switch |
| **Forms** | Single column always | 2-column layout on desktop for settings/profile forms |
| **Modals** | Fixed center | Mobile: full-screen bottom sheet. Desktop: centered dialog |
| **Touch targets** | Some buttons are 32px height | Minimum 44px height on all interactive elements |

---

## 12. Accessibility

### Current Assessment
- ✅ Radix primitives provide ARIA roles, focus traps, keyboard nav
- ⚠️ Custom buttons/inputs lack explicit `aria-label`
- ⚠️ No skip-to-content link
- ⚠️ Color contrast needs audit (muted-foreground may fail WCAG AA)
- ⚠️ SVG radar chart has no `aria-label` or text alternative
- ❌ No reduced-motion support (`prefers-reduced-motion`)

### Improvement Plan

1. Add skip-to-content link in root layout
2. Add `aria-label` to all icon-only buttons
3. Audit and fix color contrast ratios (OKLCH values)
4. Add `@media (prefers-reduced-motion: reduce)` to disable animations
5. Add `alt` text to all decorative images
6. Ensure all form inputs have associated `<Label>` components
7. Add `aria-live="polite"` regions for dynamic content updates (toast, filter results)

---

## 13. Library Integration Strategy

### Libraries to Add

| Library | Purpose | Size Impact |
|---------|---------|-------------|
| `next-themes` | Dark/light mode provider | ~2KB |
| `framer-motion` **(if user approves)** | Page transitions, staggered animations | ~30KB (tree-shaken) |
| Chart library **(awaiting user choice)** | Dashboard visualizations | Varies |

### Libraries to Leverage (Already Installed)

| Library | Current Usage | Expanded Usage |
|---------|--------------|----------------|
| `class-variance-authority` | Badge, Alert only | All buttons, inputs, cards |
| `tailwind-merge` + `clsx` | `cn()` helper | Continue as-is |
| `tw-animate-css` | Imported but barely used | Leverage for Radix enter/exit |
| `lucide-react` | Icons everywhere | Continue — add to sidebar nav |
| `sonner` | Toasts | Continue — already well configured |
| `@radix-ui/*` | 6 primitives | Consider adding `Tooltip`, `Popover` via shadcn |

### Libraries NOT to Add
- No Chakra UI, Ant Design, or Material UI
- No additional CSS-in-JS libraries
- No additional icon libraries
- Only what the user explicitly provides

---

## 14. Implementation Phases

### Phase 1: Foundation (Estimated: 2-3 sessions)
**"Install primitives & build the design system"**

1. Install missing shadcn/ui components (`button`, `card`, `input`, `label`, `tabs`, `tooltip`, `sheet`, `skeleton`, `progress`, `table`, `popover`, `command`, `scroll-area`, `switch`)
2. Refine `globals.css` tokens (add success/warning/info colors, shadow scale)
3. Create shared components (`PageHeader`, `EmptyState`, `StatCard`, `StatusBadge`, `SearchInput`, `SectionCard`, `ConfirmDialog`)
4. Install `next-themes`, create `ThemeProvider` and `ThemeToggle`
5. Build new layout components (`AppSidebar`, `AppHeader`, `MobileBottomNav`, `BreadcrumbNav`)

### Phase 2: App Shell & Navigation (Estimated: 1-2 sessions)
**"Replace all 3 layouts with unified sidebar shell"**

1. Update `(student)/layout.tsx` — Replace header-only nav with sidebar + header shell
2. Update `(recruiter)/layout.tsx` — Same shell, different nav items
3. Update `(admin)/layout.tsx` — Same shell, admin nav items
4. Implement mobile bottom tab bar
5. Add breadcrumb auto-generation
6. Add dark mode toggle to header
7. Verify all routes render correctly with new shell

### Phase 3: Core Page Redesigns (Estimated: 3-4 sessions)
**"Rebuild pages using shared components"**

1. **Student Dashboard** — Build proper hub page
2. **Jobs page** — Replace inline styles with primitives
3. **Applications page** — Use `Tabs`, `SearchInput`, `Card`
4. **Interviews page** — Use `StatCard`, improve interview room
5. **Resume page** — Animated score rings, improved keyword cloud
6. **Career/Skill Gap pages** — Improved roadmap view, bar charts
7. **Profile page** — 2-column form layout

### Phase 4: Recruiter & Admin Pages (Estimated: 2 sessions)
**"Unify recruiter/admin dashboards"**

1. **Recruiter Dashboard** — Shared `StatCard`, add charts
2. **Recruiter Applicants** — `DataTable` shared component
3. **Admin Dashboard** — Charts, trend visualizations
4. **Admin Audit Log** — `DataTable` with date range picker

### Phase 5: Polish & Delight (Estimated: 1-2 sessions)
**"Animations, loading states, accessibility"**

1. Add `loading.tsx` skeletons to all routes
2. Add page entrance animations (staggered fade-up)
3. Add micro-interactions (button press, card hover, tab slide)
4. Add chart animations (count-up, draw-in)
5. Accessibility audit and fixes
6. Dark mode testing across all pages
7. Landing page enhancement
8. Mobile testing and refinements

---

## 15. Files to Change

### New Files to Create (~25 files)

```
src/components/layout/
├── app-sidebar.tsx
├── app-header.tsx
├── mobile-bottom-nav.tsx
├── mobile-nav-sheet.tsx
├── breadcrumb-nav.tsx
├── theme-toggle.tsx
├── theme-provider.tsx
├── portal-switcher.tsx
└── sidebar-nav-item.tsx

src/components/shared/
├── stat-card.tsx
├── page-header.tsx
├── empty-state.tsx
├── status-badge.tsx
├── search-input.tsx
├── filter-bar.tsx
├── section-card.tsx
├── confirm-dialog.tsx
├── data-table.tsx
└── metric-chart.tsx

src/components/ui/ (via shadcn install)
├── button.tsx
├── card.tsx
├── input.tsx
├── label.tsx
├── tabs.tsx
├── tooltip.tsx
├── sheet.tsx
├── skeleton.tsx
├── progress.tsx
├── table.tsx
├── popover.tsx
├── command.tsx
├── scroll-area.tsx
└── switch.tsx
```

### Files to Modify (~35 files)

```
Layouts (4):
  src/app/(student)/layout.tsx
  src/app/(recruiter)/layout.tsx
  src/app/(admin)/layout.tsx
  src/app/layout.tsx

Global Styles (1):
  src/app/globals.css

Pages (~15):
  src/app/page.tsx  (landing)
  src/app/(student)/jobs/page.tsx
  src/app/(student)/applications/page.tsx
  src/app/(student)/interviews/page.tsx
  src/app/(student)/interviews/[id]/page.tsx
  src/app/(student)/resume/page.tsx
  src/app/(student)/career/page.tsx
  src/app/(student)/skill-gap/page.tsx
  src/app/(student)/profile/page.tsx
  src/app/(student)/experiences/page.tsx
  src/app/(recruiter)/recruiter/dashboard/page.tsx
  src/app/(recruiter)/recruiter/applicants/page.tsx
  src/app/(recruiter)/recruiter/jobs/page.tsx
  src/app/(admin)/admin/dashboard/page.tsx
  src/app/(admin)/admin/audit-log/page.tsx

Components (~15):
  src/components/jobs/job-card.tsx
  src/components/jobs/job-filters.tsx
  src/components/applications/application-card.tsx
  src/components/applications/applications-list-client.tsx
  src/components/applications/recruiter-applicants-client.tsx
  src/components/interviews/interview-card.tsx
  src/components/interviews/create-interview-form.tsx
  src/components/interviews/interview-agent.tsx
  src/components/resume/resume-analysis-view.tsx
  src/components/resume/resume-uploader.tsx
  src/components/career/skill-gap-view.tsx
  src/components/career/career-roadmap-view.tsx
  src/components/career/recommendations-section.tsx
  src/components/subscription/email-subscription-card.tsx
  src/components/student/profile-form.tsx

Loading States (8+ new):
  Various loading.tsx files across routes
```

---

## 16. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing server actions/business logic | High | Layout/component changes only touch JSX rendering — NO modifications to `src/actions/*`, `src/lib/*`, `src/schemas/*`, or Prisma schema |
| Clerk auth disrupted by layout change | High | `ClerkProvider` placement pattern preserved exactly. Only the JSX structure inside changes |
| CSP headers block new resources | Medium | If new libraries need external resources, update `next.config.ts` CSP accordingly |
| Performance regression from animation library | Medium | Use CSS animations first. Framer-motion only if user approves, tree-shaken |
| Dark mode breaks existing inline color classes | Medium | Audit all hardcoded colors (e.g., `bg-indigo-50`, `text-indigo-700`) and add dark: variants |
| Mobile bottom nav overlaps page content | Low | Add `pb-16` to main content area on mobile |
| Sidebar width breaks narrow content | Low | Content area uses `flex-1` — naturally adapts |

---

## Open Questions for User

> [!IMPORTANT]
> Before starting implementation, I need your decisions on:

1. **Chart library preference** — Recharts, Tremor, Chart.js, or keep custom SVG?
2. **Animation library** — Pure CSS animations, or add `framer-motion` for page transitions?
3. **Libraries.dev components** — You mentioned providing specific library prompts/components. Please share them so I can integrate them into the plan.
4. **Landing page scope** — Full marketing page redesign, or just polish the existing one?
5. **Sidebar vs. Header-only navigation** — Confirmed you want a sidebar, or prefer an enhanced top-nav-only approach?
