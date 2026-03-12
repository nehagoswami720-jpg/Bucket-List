# Wander — Build Progress & Reference

## What We're Building
A mobile-first experience sharing app. People submit authentic stories, browse them on an infinite canvas, and save them to a personal bucket list.

**Stack:** Next.js (app router) · React · TypeScript · Framer Motion · Supabase · Vercel
**Style:** Inline styles only — no Tailwind, no CSS modules
**Repo:** https://github.com/nehagoswami720-jpg/Bucket-List.git · branch: `main`

---

## App Flow

```
Splash Screen
  → WelcomeSheet (bottom sheet)
    → MainScreen
        ├── Wander Tab  — infinite pan/zoom canvas, story bubbles
        └── Collect Tab — paper scroll list of saved stories
```

Auth is **never forced on browsing**. It triggers only when the user tries to **save** or **submit** a story.

---

## Screens & Components

| File | Purpose |
|------|---------|
| `app/page.tsx` | Root state machine (splash → welcome → main) |
| `app/components/SplashScreen.tsx` | André Gide quote typewriter + Continue button |
| `app/components/WelcomeSheet.tsx` | Bottom sheet onboarding |
| `app/components/MainScreen.tsx` | Tab orchestration, auth state, save/submit logic |
| `app/components/WanderFeed.tsx` | Infinite canvas, story bubbles, filter chips |
| `app/components/StorySheet.tsx` | 5-step story submission flow with voice input |
| `app/components/StoryBottomSheet.tsx` | Story reader sheet (shared by Wander + Collect) |
| `app/components/CollectGrid.tsx` | Paper scroll list of saved stories with checkboxes |
| `app/components/AuthSheet.tsx` | Email magic link sign-in sheet |
| `app/components/BottomNav.tsx` | Tab bar + share button |

---

## Backend (Supabase)

### Tables
- **`profiles`** — mirrors `auth.users`, auto-created on signup via trigger
- **`stories`** — submitted stories: `title`, `moment`, `worth_it`, `advice` (optional), `category`, `status`
- **`saves`** — junction: `user_id` + `story_id` + `is_done` (Collect tab checkbox)

### Enums
- `story_category`: Adventure · Learning · Connecting · Going wild · Going solo
- `story_status`: published · pending · rejected

### RLS
- Stories: anyone can read `published`, only author can insert/update/delete
- Saves: user can only read/write their own rows

### Key files
- `app/lib/supabase.ts` — Supabase client
- `app/lib/authContext.tsx` — React auth context (`useAuth()` hook)
- `app/lib/api.ts` — all DB calls: `fetchStories`, `submitStory`, `fetchSavesWithStories`, `saveStory`, `unsaveStory`, `toggleDone`
- `app/lib/storyTypes.ts` — shared types: `DBStory`, `Story` (extends DBStory + canvas props), `Category`, `CATEGORY_COLOR`
- `supabase/migrations/001_initial_schema.sql` — full schema + RLS

---

## User Flows (as built)

### Browse
1. Open app → splash → welcome → Wander tab
2. Stories load from Supabase, placed on canvas via deterministic UUID hash
3. Tap bubble → StoryBottomSheet slides up with full story
4. No auth required

### Save
1. Tap "Save to my bucket list" on StoryBottomSheet
2. If not logged in → AuthSheet slides up (email magic link)
3. After sign-in → save executes automatically (pending action pattern)
4. Story appears in Collect tab

### Submit
1. Tap + (pencil) in bottom nav → StorySheet opens
2. 5 questions: moment · worth it · advice (optional) · category · title
3. Voice input available on text questions (Web Speech API, HTTPS only)
4. "Share my story" → if not logged in → AuthSheet
5. After sign-in → story submitted to Supabase, WanderFeed re-fetches

### Collect
1. Logged-in user switches to Collect tab
2. Paper scroll list of saved stories loads from Supabase
3. Checkbox → marks `is_done` in DB with strikethrough animation
4. Tap story title → StoryBottomSheet opens (with unsave option)

### Auth
- Email magic link only (MVP — Google OAuth skipped)
- Triggers only on save or submit, never on browse
- After sign-in, pending action (save/submit) executes automatically

---

## Design System

| Token | Value |
|-------|-------|
| Background | `#EDEAE5` |
| Paper | `#F5F0E8` |
| Primary dark | `#282828` |
| Question font | Helvetica, 22px, weight 400 |
| Body/input font | Courier New, monospace, `letterSpacing: -0.04em` |
| Placeholder | `#6D6D6D`, weight 500 |
| Typed text | `#555555`, weight 600 |
| Sheet border radius | `26px 26px 0 0` |
| CTA button | `#282828` bg, white text, 18px Courier bold, 14px radius, 280px max-width |

### Category colours
| Category | Colour |
|----------|--------|
| Adventure | `#20500C` |
| Learning | `#1D49A1` |
| Connecting | `#D56606` |
| Going wild | `#6E0476` |
| Going solo | `#9C1B35` |

---

## Backpocket — Deferred Issues

These were identified during backend wiring and will be fixed in a future pass.

1. **AuthSheet doesn't auto-close after sign-in**
   `showAuthSheet` stays `true` in MainScreen even after `onAuthStateChange` fires. Need to watch `user` in a `useEffect` and call `setShowAuthSheet(false)`.

2. **Collect tab for logged-out users**
   Currently shows "nothing saved yet" — misleading. A logged-out user should see a "sign in to save stories" prompt instead.

3. **WanderFeed canvas position `useEffect` bug**
   `[stories.length > 0]` evaluates to a boolean, not a proper reactive dependency. The random pan-to-cluster fires before stories load. Fix: separate fetch effect and pan effect properly.

4. **Blank canvas while stories load**
   No loading state in WanderFeed. Canvas is empty during Supabase fetch. Need a subtle loading indicator.

5. **StorySheet state reset after unauthenticated submit**
   When auth is required mid-submit, StorySheet sits open under AuthSheet. After sign-in, `performSubmit` fires and `setShowStorySheet(false)` closes it. Internal step/answer state should reset via the existing `useEffect` on `open`. Needs end-to-end testing to confirm it works correctly.

---

## Git History

```
0a58b3d  Wire Supabase backend: auth, story fetch/submit, save/done flows
9250d84  Complete save flow: story bottom sheet micro-interactions and Collect tab reader
815a0c7  Add voice input to story submission with word-by-word transcript animation
912a890  Streamline story submission from 6 to 5 questions
06646be  Enable zoom on Wander canvas and fix double dot-grid background
4481454  Add Collect tab: scrollable paper list with animations
878f7d3  Redesign bottom nav, polish story sheet, multi-select filter chips
```

---

## Next Steps (when resuming)

- Work through each user flow screen by screen with design input
- Tackle backpocket issues above
- Seed DB with real stories for testing
- Deploy to Vercel (magic link auth requires HTTPS — Vercel deploy will make mobile testing work)
