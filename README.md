# Wander

A mobile-first experience sharing app. People share things they've tried that others should know about — a trip, a skill, a moment. Others save them to their bucket list.

## Tech stack

- **Next.js** (app router) + **TypeScript**
- **Framer Motion** — all animations
- **Supabase** — database + magic link auth
- **Anthropic Claude** — AI story stitching
- Inline styles only (no Tailwind, no CSS modules)

## App flow

```
First-time visitor:  Splash → Welcome sheet → Main screen
Returning (signed in): Main screen directly
Returning (not signed in): Splash → Welcome sheet → Main screen
```

### Main screen — two tabs

| Tab | Description |
|-----|-------------|
| **Wander** | Infinite pan canvas of story bubbles. Empty state only when DB has zero published stories. |
| **Collect** | Personal bucket list — stories the user has saved. Empty state per user until first save. |

## Story submission flow (StorySheet — 6 steps)

| Step | Prompt |
|------|--------|
| 0 | What's something you tried that you wish someone had told you about sooner? |
| 1 | Take us there. What do you remember most about that moment? |
| 2 | What made this worth it? |
| 3 | If a friend texted you right now asking how to try this — what would you tell them? |
| 4 | Category selection (Adventure / Learning / Connecting / Going wild / Going solo) |
| 5 | Give your story a title. |

On submit, raw answers are sent to `/api/generate-story` — Claude (Haiku) lightly stitches them into a cohesive first-person narrative with minimal interference. The result is stored in the `body` column. No account required to submit.

## Auth

Magic link via Supabase. Required only to save stories to a bucket list. Anonymous story submission is allowed. Users never sign out — no logout flow.

**Pending save flow:** if an unauthenticated user taps "Save", their story is stored in `localStorage` and they're prompted to sign in. After the magic link redirect, the save is completed automatically.

## Database (Supabase)

### `stories`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | primary key |
| title | text | |
| category | text | one of 5 categories |
| moment | text | raw prompt answer |
| worth_it | text | raw prompt answer |
| advice | text | nullable |
| body | text | AI-generated narrative (nullable, falls back to raw fields) |
| status | text | `pending` on insert, manually set to `published` |
| created_at | timestamptz | |

### `saves`
| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | FK → auth.users |
| story_id | uuid | FK → stories |
| is_done | boolean | bucket list item checked off |

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

## Deployment (Vercel)

1. Import the GitHub repo at vercel.com
2. Add the three environment variables above in project settings
3. Deploy — auto-deploys on every push to `main`

## Key files

```
app/
  page.tsx                  — root state machine (splash → main)
  api/
    generate-story/
      route.ts              — Claude API route for story stitching
  components/
    SplashScreen.tsx        — André Gide quote typewriter
    WelcomeSheet.tsx        — envelope bottom sheet
    MainScreen.tsx          — tab controller, save/auth logic
    WanderFeed.tsx          — infinite pan canvas + story bubbles
    CollectGrid.tsx         — bucket list view
    StorySheet.tsx          — 6-step story submission flow
    StoryBottomSheet.tsx    — story reader sheet
    AuthSheet.tsx           — magic link sign-in sheet
    BottomNav.tsx           — tab bar
  lib/
    storyTypes.ts           — DBStory, Story, Category types
    api.ts                  — Supabase queries
    authContext.tsx         — Supabase auth provider
    supabase.ts             — Supabase client
```
