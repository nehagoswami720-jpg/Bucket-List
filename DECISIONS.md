# Wander — Design, System & Product Decisions

This document captures the reasoning, trade-offs, pivots, and decisions made while building Wander. It exists so future contributors (or future us) understand not just *what* was built, but *why*.

---

## Product Philosophy

Wander is a mobile-first experience sharing app. People submit authentic stories about things they've tried, browse them on an infinite canvas, and save them to a personal bucket list.

The design principle throughout: **never force the user into anything**. Auth is never shown unprompted. The experience is browsable without an account. Friction only appears at the moment someone wants to *own* something — save a story or share one.

---

## Design Decisions

### Inline styles only — no Tailwind, no CSS modules
**Decision:** All styling is done via React inline style objects.

**Why:** This was an intentional constraint. Inline styles keep every component fully self-contained — no class name lookup, no stylesheet to cross-reference. For a fast-moving project where the design is being discovered as we go, this removes a whole class of friction. The trade-off is verbosity, but for a small codebase this is acceptable.

---

### Typography
**Helvetica** for all UI labels, headings, questions — clean, neutral, slightly editorial.
**Courier New (monospace)** for all body text, inputs, story content — gives the app a handwritten/typewritten feel that matches the "authentic story" theme.

The contrast between the two creates a visual hierarchy without needing font weights to do all the heavy lifting.

---

### Color palette
| Token | Value | Use |
|-------|-------|-----|
| Background | `#EDEAE5` | Main app background — warm off-white |
| Paper | `#F5F0E8` | Sheets, cards — slightly warmer |
| Primary dark | `#282828` | Buttons, text, borders |
| Placeholder | `#6D6D6D` | Secondary text |
| Typed text | `#555555` | Active input text |

Warm neutrals throughout. No pure blacks or whites. The palette was chosen to feel like paper and ink — analogue, not digital.

Category colors are intentionally bold and distinct — they're the only colour in the UI, so they carry the visual identity of each category on the canvas.

---

### Framer Motion for all animations
Every animated element uses Framer Motion — no CSS transitions except where Framer Motion can't reach (e.g. `background-color` on native elements, which requires Framer Motion's `animate` prop to avoid conflicts).

**Key lesson learned:** When a Framer Motion `animate` prop controls an element, CSS `transition` properties on the same element don't reliably fire. `backgroundColor` for the AuthSheet button was broken until we moved it into Framer Motion's `animate` system via `useAnimationControls`.

---

### Bottom sheet pattern
Every overlay in the app is a bottom sheet — AuthSheet, StorySheet, StoryBottomSheet, WelcomeSheet. This matches native mobile patterns and keeps the interaction model consistent. Sheets animate in with spring physics, dim the background with a blur backdrop, and can be dismissed by tapping outside.

---

### Infinite canvas (Wander feed)
Stories are placed on a 3000×3000px canvas using a **golden-angle spiral** for collision-free placement. Visual properties (rotation, bob speed, tail direction, bubble size) are derived **deterministically from the story UUID** using a hash function — so the same story always renders the same way, across sessions and users.

The canvas pans to a random spot within the bubble cluster on load so no two users land in exactly the same place.

---

## Auth Decisions

### Magic link only — no password, no Google OAuth
**Decision:** Email magic link (`supabase.auth.signInWithOtp`) is the only auth method.

**Why magic link over password:** Passwords require a password reset flow, a confirm password field, validation rules. Magic links are one field, one button, done. For an MVP where auth is a side effect (not the product), this is the right call.

**Why not Google OAuth:** Google OAuth was scoped but removed before shipping. Adding OAuth requires setting up redirect URIs, testing across environments, handling token refresh edge cases — all complexity that doesn't affect the core product experience. Deferred to a later iteration.

---

### No logout
**Decision:** There is no sign-out button or mechanism in the app.

**Why:** Users on mobile apps don't sign out. Instagram, Pinterest, TikTok — you open them and you're in. Adding a logout button introduces a state (signed-out returning user) that then requires designing a re-entry flow. By removing logout entirely, the auth surface becomes:

- **New user:** sign up once when they want to save something
- **Returning user:** always signed in, goes straight to the feed

This removed an entire class of edge cases and UI complexity.

**Trade-off:** A user who wants to switch accounts on the same device can't. This is an acceptable trade-off for an MVP.

---

### localStorage flag for onboarding (`wander_onboarded`)
**Decision:** When a user first signs in, `localStorage.setItem('wander_onboarded', 'true')` is set. On app load, signed-in users skip the splash and welcome screens.

**Why:** The splash screen and welcome sheet are first-time onboarding. Returning signed-in users should never see them again. The Supabase session (`getSession()`) tells us if the user is currently authenticated — if they are, we skip onboarding. This flag would have been needed for signed-out returning users, but since we removed logout, it's technically only the active session check that matters now. The flag is kept as a safety net.

---

### Pending save — localStorage (not sessionStorage)
**Decision:** When a user tries to save a story while signed out, the story is stored in `localStorage` under `wander_pending_save` before the AuthSheet opens.

**Why localStorage and not sessionStorage:** This was a pivot. We initially used `sessionStorage`, which seemed right (temporary, cleared when the tab closes). But when a user clicks the magic link in their email client, it opens in a **new tab** — and `sessionStorage` is per-tab. The new tab has no knowledge of what the user was doing. `localStorage` persists across tabs and page reloads, so the pending story survives the redirect.

**After sign-in:** The `useEffect` watching `user` reads and clears the key, executes the save, and opens the story sheet automatically.

---

### Pending action pattern (in-memory ref)
For same-session auth (rare — would happen if the tab stays open and the magic link somehow resolves in the same tab), a `pendingActionRef` stores the function to run after sign-in. This covers both save and submit flows without duplicating logic.

---

## Backend Decisions

### Supabase
Chosen for: built-in auth, Postgres, RLS, real-time (future), generous free tier, fast setup. No backend server needed.

---

### Schema design

**`profiles`** — mirrors `auth.users`. Auto-created via a trigger on `auth.users` insert. Exists so we have a place to add user-facing data (username, avatar) later without touching auth internals.

**`stories`** — the core content table. Fields:
- `title`, `moment`, `worth_it`, `advice` (nullable — optional step in submission)
- `category` — enum, one of 5 values
- `status` — enum: `published`, `pending`, `rejected`. New submissions go to `pending`. This gives us a moderation layer before stories appear on the canvas.
- `user_id` — FK to `profiles`, not-null. Every story has an author.

**`saves`** — junction table: `user_id` + `story_id` + `is_done`. The `is_done` boolean powers the Collect tab checkbox (marking a bucket list item as done). Unique constraint on `(user_id, story_id)` prevents duplicate saves.

---

### RLS (Row Level Security)
- **Stories:** anyone can read `published` stories. Only the author can insert/update/delete their own.
- **Saves:** users can only read and write their own rows.
- **Profiles:** users can only read and update their own profile.

This means the Supabase anon key can be safely exposed in the frontend — RLS enforces all access control at the database level.

---

### Story status flow
`pending` → (manual review) → `published` or `rejected`

Stories don't appear on the Wander canvas until they're `published`. This prevents spam and low-quality content from appearing immediately. The trade-off: submission isn't instant gratification for the user. This is acceptable for an MVP where the founder is reviewing submissions manually.

---

## Component Architecture Decisions

### Saved state lifted to MainScreen
Initially, save state was local to `StoryBottomSheet`. This was refactored to lift saved state up to `MainScreen` as the single source of truth.

**Why:** Both the Wander feed and the Collect tab need to know which stories are saved. If save state lives inside `StoryBottomSheet`, the Collect tab can't see it without prop drilling or a context. Lifting it to `MainScreen` means both tabs always reflect the same truth.

---

### DBStory vs Story types
`DBStory` is the raw Supabase shape (id, title, category, moment, worth_it, advice, created_at).
`Story extends DBStory` adds canvas-specific props (x, y, rotation, bobDuration, bobDelay, tailDir, seed, w, h).

This separation keeps the API layer clean — Supabase returns `DBStory`, canvas placement logic converts them to `Story`. The `StoryBottomSheet` and `CollectGrid` only need `DBStory` since they don't care about canvas position.

---

### StoryBottomSheet as a shared controlled component
The story reader sheet is used by both WanderFeed and CollectGrid. It was extracted to its own file as a fully controlled component: `story: DBStory | null`, `isSaved: boolean`, `onSaveToggle`, `onClose`. When `story` is null, the sheet is hidden.

---

## Pivots

| What changed | Why |
|---|---|
| Google OAuth → removed | Too much complexity for MVP, magic link is sufficient |
| Logout icon → removed | Users never sign out; removing it eliminated an entire edge case category |
| Returning signed-out user Collect tab prompt → removed | Can't happen without logout, so the state is unreachable |
| `sessionStorage` → `localStorage` for pending save | Magic link opens in a new tab; sessionStorage is tab-scoped |
| 6-step story submission → 5 steps | Streamlined — the "title" step was moved and the flow felt tighter |
| Hardcoded canvas stories → Supabase fetch | Moved from static mock data to real DB when backend was wired |
| Local save state in StoryBottomSheet → lifted to MainScreen | Required for Collect tab to reflect saves in real-time |

---

## Known Issues (Backpocket)

These were identified and deliberately deferred — not forgotten.

1. **WanderFeed canvas position `useEffect` bug** — `[stories.length > 0]` evaluates to a boolean, not a reactive dependency. The pan-to-cluster might not fire correctly in all cases. Fix: separate the fetch effect and the pan effect properly.

2. **Blank canvas during story load** — WanderFeed returns `null` while loading (prevents the canvas flash before empty state). A subtle loading indicator would improve the experience.

3. **StorySheet state reset after unauthenticated submit** — when auth is required mid-submit, StorySheet sits open under AuthSheet. After sign-in, `performSubmit` fires and `setShowStorySheet(false)` closes it. The internal step/answer state should reset via the existing `useEffect` on `open`. Needs end-to-end testing to confirm it works correctly.

4. **Post-auth story sheet race condition** — `fetchSavesWithStories` and `performSave` both fire when `user` becomes non-null. If `fetchSavesWithStories` resolves after `performSave` adds the story to local state, it may overwrite it. In production this is fine (the story will be in DB). For mock stories not in DB, the Collect tab may not show the story after reload.

---

## What's Intentionally Not Built (MVP scope)

- **Push notifications** — "someone saved your story"
- **Story discovery algorithm** — currently chronological. No personalisation, no recommendations.
- **User profiles** — no public profile page, no "stories by this person"
- **Social features** — no comments, no likes, no follows
- **Admin moderation UI** — story review is done directly in Supabase dashboard
- **Password/OAuth auth** — magic link only
- **Multiple accounts** — no account switching

All of the above are valid next steps. None of them are needed for the core loop to work.

---

## Deployment Notes

- Magic link auth requires HTTPS — the `emailRedirectTo` URL must be a real domain. Testing on `localhost` works only on the same machine (not mobile).
- Supabase free tier caps OTP emails at **2 per hour**. This will hit during development testing. On production this limit is lifted with a custom SMTP provider.
- The `wander_onboarded` localStorage key and `wander_pending_save` localStorage key are the two persistent client-side state values. Both should be cleared when testing fresh user flows.
