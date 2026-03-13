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

## Auth Flow (as built)

### New user
1. Opens app → Splash → WelcomeSheet → Wander feed
2. Taps story → taps "Save to my bucket list" → AuthSheet slides up
3. Enters email → magic link sent → clicks link in email → redirected back
4. Story sheet opens automatically with saved state (pending save recovered from `localStorage`)
5. Collect tab shows paper bucket list
6. Always signed in from this point — no logout

### Returning user (signed in)
- Opens app → straight to Wander feed (splash + welcome skipped)

### Why no logout
Users on mobile apps don't sign out. Removing logout eliminates an entire class of edge cases. See `DECISIONS.md` for full reasoning.

### Key localStorage keys
- `wander_onboarded` — set on first `SIGNED_IN` event, used to skip onboarding for returning users
- `wander_pending_save` — stores story JSON before magic link redirect so it survives cross-tab navigation

---

## Backpocket — Deferred Issues

1. **WanderFeed canvas position `useEffect` bug**
   `[stories.length > 0]` evaluates to a boolean, not a proper reactive dependency. Fix: separate fetch effect and pan effect properly.

2. **Blank canvas while stories load**
   WanderFeed returns `null` while loading (prevents canvas flash). A subtle loading indicator would improve the experience.

3. **StorySheet state reset after unauthenticated submit**
   When auth is required mid-submit, StorySheet sits open under AuthSheet. After sign-in, `performSubmit` fires and `setShowStorySheet(false)` closes it. Needs end-to-end testing to confirm state resets correctly.

4. **Post-auth story sheet race condition**
   `fetchSavesWithStories` and `performSave` both fire when user becomes non-null. May cause a brief state conflict. Fine in production (story is in DB). Mock stories not in DB will not persist to Collect tab after reload.

---

## Git History

```
4eed453  Complete 6-question story submission flow with category selection
072c0d1  Add questions 2-4, back navigation, ripple CTA, and direction-aware transitions
10c8fc9  Build full app flow: splash → welcome sheet → main screen → story submission
4ab2004  Add splash screen and welcome bottom sheet
00efc4d  Initial commit from Create Next App
```

---

## Next Steps (when resuming)

- Test full sign-up flow end-to-end on mobile after Vercel deploy
- Seed DB with real stories
- Deploy to Vercel (magic link auth requires HTTPS for mobile testing)
- See `DECISIONS.md` for full design + system reasoning
