# Wander

A mobile-first experience sharing app. People share things they've tried that others should know about — a trip, a skill, a moment. Others save them to their bucket list.

---

## Tech stack

- **Next.js** (app router) + **TypeScript**
- **Framer Motion** — all animations, transitions, micro-interactions
- **Supabase** — Postgres database, magic link auth, Realtime subscriptions
- **Anthropic Claude** (Haiku) — AI story stitching on submission
- **lottie-react** — loading animation
- **react-zoom-pan-pinch** — infinite pan canvas on Wander feed
- Inline styles only — no Tailwind, no CSS modules, no class names

---

## App flow

```
First-time visitor:      Splash → Welcome sheet → Main screen
Returning (signed in):   Main screen directly
Returning (not signed):  Splash → Welcome sheet → Main screen
```

### Screens

| Screen | File | Description |
|--------|------|-------------|
| Splash | `SplashScreen.tsx` | André Gide quote typewriter, shifts up on complete, "Continue" fades in |
| Welcome | `WelcomeSheet.tsx` | Full-height bottom sheet, envelope icon, poetic copy |
| Main | `MainScreen.tsx` | Tab controller — Wander + Collect |
| Wander feed | `WanderFeed.tsx` | Infinite pan canvas of story bubbles |
| Collect | `CollectGrid.tsx` | Personal bucket list, paper stack aesthetic |
| Story reader | `StoryBottomSheet.tsx` | 68vh bottom sheet, story body + save button |
| Story submission | `StorySheet.tsx` | 5-step guided form |
| Auth | `AuthSheet.tsx` | Magic link sign-in |

---

## Story submission flow (`StorySheet` — 5 steps)

| Step | Prompt | Notes |
|------|--------|-------|
| 0 | What's something you tried that you wish someone had told you sooner, and what do you remember most about that moment? | Required |
| 1 | What made this experience worth it? | Required |
| 2 | If a friend texted you right now asking how to try this, what would you tell them? | **Optional** — CTA enabled even when blank |
| 3 | Category selection | Multi-select: Adventure / Learning / Connecting / Going wild / Going solo |
| 4 | Give your story a title. Make it one they can't ignore. | Required |

**On submit:** raw answers → `/api/generate-story` → Claude Haiku lightly stitches them into a first-person narrative → stored in `body` column alongside raw fields. No account required to submit.

**Character limits:** body fields 280 chars, title 80 chars.

---

## Auth

Magic link via Supabase. Required only to **save** stories to a bucket list. Anonymous story submission is always allowed.

**Pending save flow:** unauthenticated user taps "Save" → story stored in `localStorage` → auth prompt → after magic link redirect, save is completed automatically and the story sheet reopens.

Users never sign out — no logout flow exists by design.

---

## Database (Supabase)

### `stories`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | primary key |
| title | text | |
| category | text[] | array — multi-select, up to 5 categories |
| moment | text | raw answer to prompt 0 |
| worth_it | text | raw answer to prompt 1 |
| advice | text | nullable — raw answer to prompt 2 |
| body | text | AI-generated narrative (nullable, UI falls back to raw fields if null) |
| status | text | always `published` on insert |
| created_at | timestamptz | |

### `saves`
| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | FK → auth.users |
| story_id | uuid | FK → stories |
| is_done | boolean | checked off on bucket list |

### Realtime
Stories table is subscribed via Supabase `postgres_changes`. New published stories appear on the Wander canvas in real-time without a page refresh.

Required SQL to enable:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE stories;
```

---

## Design system

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| Background | `#FFF7ED` | App background, canvas |
| Sheet background | `#FFF3E5` | All bottom sheets |
| Primary dark | `#282828` | Buttons, active text, icons |
| Body text | `#202020` | Questions, headings |
| Muted text | `#6D6D6D` | Placeholders, subtitles |
| Saved/done green | `#20500C` | Saved state, strikethrough |
| Error | `#e03b3b` | Char limit warning, auth errors |
| Recording red | `#8B1A1A` | Mic active state |

### Typography
| Usage | Font | Size | Weight |
|-------|------|------|--------|
| Questions | Helvetica | 22px | 400 |
| UI labels, nav, back button | Helvetica | 11–17px | 400–600 |
| Body copy, inputs, story text | Courier New | 16px | 500–600 |
| CTA buttons | Courier New | 18px | 700 |
| Story titles | Helvetica | 24px | 700 |
| Placeholder text | Courier New | 16px | 500, lineHeight 1.25 |
| Typed/body text | Courier New | 16px | 600, lineHeight 1.55 |
| Story reader body | Courier New | 16px | normal, lineHeight 1.45, letterSpacing -0.03em |

### Sheets
- Border radius: `26px 26px 0 0` (mobile bottom sheets)
- Slide-in animation: spring, stiffness 280, damping 32
- All sheets are full-width — no centered modal behavior on desktop (intentional)

---

## Responsive design

The app is mobile-first. Desktop adaptations are intentionally minimal to preserve the app-like feel:

| Component | Mobile | Desktop (≥768px) |
|-----------|--------|-----------------|
| `BottomNav` | Icons 20px, tabs `4px 28px`, button 56px | Icons 24px, tabs `6px 48px`, button 68px |
| `CollectGrid` | Max-width 390px | Max-width 640px |
| All bottom sheets | Full-width | Full-width (unchanged by design) |
| Wander canvas | Full viewport | Full viewport |

The `useWindowSize` hook (`app/lib/useWindowSize.ts`) provides `{ width, isDesktop }` for responsive adjustments.

---

## Key design decisions & trade-offs

### Why inline styles only?
Keeps component logic and visual logic co-located. No build-time CSS, no class name collisions, easy to audit. Trade-off: verbose, no pseudo-selectors (`:hover` handled via Framer Motion `whileHover`).

### Why no logout?
Wander is designed to feel like a persistent companion. Forcing sign-out flows creates friction that doesn't match the product's tone. Users who clear cookies naturally reset.

### Why allow anonymous story submission?
Lowering the barrier to contribution is core to the product. Requiring auth before submitting would drop conversion significantly. Trade-off: submissions can't be attributed to a user account.

### Why Claude Haiku for story stitching?
Speed and cost. Haiku is fast enough to complete before Supabase insert, cheap enough to run per-submission at low scale. The prompt intentionally limits interference — Claude fills gaps, not rewrites. Trade-off: occasionally the stitching is flat; raw field fallback exists if `body` is null.

### Why Supabase Realtime instead of polling?
Zero-latency story appearances feel magical on the canvas. Polling would require a timer and could miss stories or show stale data. Trade-off: requires the `supabase_realtime` publication to be configured manually in the dashboard.

### Why `category: text[]` (array) instead of a join table?
Stories have 1–5 categories but no category-level querying is needed yet. An array column is simpler to insert, select, and filter on. Trade-off: harder to enforce referential integrity; filtering requires `@>` or `&&` operators rather than joins.

### Why `status: published` on insert instead of a review queue?
Removes operational overhead for an early-stage product. Trade-off: no moderation. Will need a review queue before scaling to untrusted users.

### Pending save via `localStorage` instead of `sessionStorage`
Magic link redirects open a new tab in some email clients, losing session state. `localStorage` persists across tabs and browser restarts. Trade-off: the pending story lingers if the user never completes sign-in.

### Wander canvas bubble placement
Phyllotaxis spiral with collision detection. Ensures bubbles never overlap regardless of how many stories exist. Trade-off: placement is computed client-side on load — large story counts (500+) may cause a brief layout delay.

---

## Local development

```bash
npm install
npm run dev
```

### Environment variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
```

---

## Deployment

1. Import the GitHub repo at vercel.com
2. Add the three env vars above in project settings
3. Deploy — auto-deploys on every push to `main`
4. In Supabase dashboard, run: `ALTER PUBLICATION supabase_realtime ADD TABLE stories;`

---

## Key files

```
app/
  page.tsx                        root state machine (splash → main)
  api/
    generate-story/route.ts       Claude Haiku story stitching API route
  components/
    SplashScreen.tsx              typewriter quote, Continue button
    WelcomeSheet.tsx              welcome bottom sheet, envelope icon
    MainScreen.tsx                tab controller, save/auth/submit logic
    WanderFeed.tsx                infinite pan canvas, story bubbles, filters, Realtime
    CollectGrid.tsx               bucket list, paper stack, checkbox done state
    StorySheet.tsx                5-step story submission form, mic input, category select
    StoryBottomSheet.tsx          story reader, save button, particle animation
    AuthSheet.tsx                 magic link sign-in
    BottomNav.tsx                 floating tab bar, responsive
    WanderEmptyState.tsx          wander tab empty state
    CollectEmptyState.tsx         collect tab empty state (no auth)
    Typewriter.tsx                character-by-character typewriter
    EnvelopeIcon.tsx              SVG envelope for welcome sheet
    FootprintsIcon.tsx            SVG footprints for nav
  lib/
    storyTypes.ts                 DBStory, Story, Category, CATEGORY_COLOR types
    api.ts                        all Supabase queries + submitStory
    authContext.tsx               Supabase auth provider + useAuth hook
    supabase.ts                   Supabase client singleton
    useWindowSize.ts              responsive breakpoint hook
  public/
    loader.json                   Lottie run-cycle animation (recolored to #282828)
```
