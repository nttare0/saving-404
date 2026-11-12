# Saving 404

A calm, desktop-first workspace for saving money together — and on your own.

Saving 404 brings rotating savings circles, member arrears, loans and interest, personal
goals, and a flexible monthly budget into one understated interface. It is a front-end
demo: every change is kept in `localStorage` and can be reset from Settings.

## What is inside

### Circles
- Create savings circles with a contribution amount, cadence, and member roster.
- See collected vs. expected funds, next payout, and how many members are up to date.
- Record a contribution against a specific member, or add a new circle from any page.
- Per-member ledgers with paid, arrears, and status (up to date, partial, behind).

### Loans
- Record money lent from a circle or personal savings, with simple interest and a term.
- Upfront interest and total-to-return preview before saving.
- Repayment tracking with partial payments, progress, overdue states, and due dates.
- Portfolio totals for outstanding principal, interest, and expected returns.

### Personal vault
- Individual goals with targets and deadlines, each with its own progress and monthly pace.
- Top up a goal from a focused dialog with quick amounts.
- Monthly auto-save rules, round-ups, and a projected finish date.
- Personal savings are always separate from circle money.

### Budget
- 50/30/20 and zero-based frameworks, switchable at any time.
- Category caps with green → amber → red progress as spending approaches the limit.
- Log an expense and preview exactly how it lands against the cap.
- Rollover mode: unused caps either roll into next month or sweep into savings.
- Income allocation, category creation/editing, and unallocated income tracking.

### Workspace
- Overview with savings growth, monthly plan, circle health, arrears, and activity.
- Command-style search (`⌘K` / `Ctrl K`), notifications, theme switcher, and profile settings.
- Light and dark themes that follow the system by default.
- Export the full workspace as JSON, or reset back to the seeded demo.

## Design

The interface follows a restrained, spacious product language:

- Slim fixed sidebar, compact top bar, centered content, and a scrollable nav row on small screens.
- Soft rounded cards, hairline borders, restrained shadows, and generous whitespace.
- Neutral surfaces with a refined violet accent; muted foreground text.
- Inter with a clear type hierarchy and compact Lucide line icons.
- Consistent buttons, badges, inputs, menus, banners, and dialogs with visible hover,
  focus, active, and disabled states.
- Charts built with [Bklit](https://bklit.com) on D3, with coordinated accents, subtle
  gridlines, accessible summaries, and minimal decoration.
- Semantic landmarks, labelled controls, keyboard-friendly dialogs and menus, and
  reduced-motion support.

Components are [shadcn/ui](https://ui.shadcn.com) (New York style), vendored under
`src/components/ui`. Bklit chart source is vendored under `src/components/charts`.

## Stack

| Tool | Role |
| --- | --- |
| Vite 7 + React 19 + TypeScript | App shell and build |
| Tailwind CSS v4 | Theme tokens and utilities |
| shadcn/ui + Radix | Accessible primitives |
| Bklit + D3 | Area, bar, and ring charts |
| React Router 7 | Client-side routing |
| next-themes | Light/dark/system themes |
| Sonner | Toasts |
| Lucide | Icons |

## Getting started

```bash
npm install
npm run dev
```

The dev server binds to `0.0.0.0:5173`.

```bash
npm run typecheck
npm run build
npm run preview
```

## Structure

```text
src/
  components/
    charts/      Vendored Bklit charts and app wrappers
    common/      Panels, stat cards, progress, avatars, inputs
    dialogs/     Contribution, loan, repayment, circle, category, expense, goal
    layout/      Sidebar, top bar, mobile nav, search, notifications, theme
    ui/          Vendored shadcn/ui primitives
  lib/           Seed data, formatting, and derived analytics
  pages/         Overview, circles, circle detail, loans, budget, vault, settings, 404
  store/         Persisted workspace reducer and actions
```

## Demo data

The seed workspace contains three circles (Umuganda, Kigali Hustlers, Family Future
Fund), 16 members, active loans, a fully allocated monthly budget, and three personal
goals. Amounts are in Rwandan francs (RWF). Reset from **Settings → Data & privacy**.

All money is illustrative. Nothing is sent to a server.

## Deploy

The project is a static Vite build. On Vercel, the included `vercel.json` builds to
`dist` and rewrites client-side routes to `index.html`.

```bash
npm run build
```
