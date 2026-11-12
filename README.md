# Saving 404

A calm, desktop-first workspace for individual saving.

Saving 404 brings personal savings goals, a monthly budget, and a deliberately simple
"add money" flow into one understated interface. It is a front-end demo: every change is
kept in `localStorage` and can be reset from Settings.

## What is inside

### My vault
- Personal goals with targets and deadlines, each with its own progress and monthly pace.
- One focused **Add money** dialog: enter an amount, pick a goal, see the result, confirm.
- Quick amounts, a "finish goal" shortcut, and a preview of the goal after the deposit.
- Monthly auto-save, round-ups, and a projected finish date.
- A running log of every top-up, auto-save, and round-up.

### Money entry
- Amounts are formatted with thousands separators as you type.
- A clear `RWF` prefix, numeric keypad on mobile, and quick presets.
- The same input is used for budgets, expenses, auto-save, and goal deposits.

### Budget
- 50/30/20 and zero-based frameworks, switchable at any time.
- Category caps with green → amber → red progress as spending approaches the limit.
- Log an expense and preview exactly how it lands against the cap.
- Rollover mode: unused caps either roll into next month or sweep into the vault.
- Income allocation, category creation/editing, and unallocated income tracking.

### Workspace
- Overview with vault balance, this month's savings, goals, recent activity, and the
  monthly plan.
- Command-style search (`⌘K` / `Ctrl K`) for pages and goals.
- Notifications for budget caps, goal milestones, and auto-save.
- Light and dark themes that follow the system by default.
- Export the full workspace as JSON, or reset back to the seeded demo.

## Group saving is hidden, not removed

Circles, contributions, payouts, loans, interest, and arrears still live in the codebase,
the seed data, and the store. They are disconnected from the interface while the product
focuses on individual saving.

`src/lib/features.ts` contains a single reversible switch:

```ts
export const GROUP_SAVING_ENABLED = false
```

With the flag off, group routes redirect to the overview and are absent from the
navigation, search, notifications, and summary cards. Set it to `true` to bring the
circles and loans screens back; their components and data are unchanged.

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
    common/      Panels, stat cards, progress, avatars, money input
    dialogs/     Goal, category, expense (plus hidden group dialogs)
    layout/      Sidebar, top bar, mobile nav, search, notifications, theme
    ui/          Vendored shadcn/ui primitives
  lib/           Seed data, formatting, analytics, feature flag, notification prefs
  pages/         Overview, vault, budget, settings, 404 (plus hidden group pages)
  store/         Persisted workspace reducer and actions
```

## Demo data

The seed workspace contains three personal goals, a fully allocated monthly budget, and a
short vault activity history. Amounts are in Rwandan francs (RWF). Reset from
**Settings → Data & privacy**.

All money is illustrative. Nothing is sent to a server.

## Deploy

The project is a static Vite build. On Vercel, the included `vercel.json` builds to
`dist` and rewrites client-side routes to `index.html`.

```bash
npm run build
```
