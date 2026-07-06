# Phonics to Physics — Project Handoff

**Start here.** This folder contains everything needed to build the Phonics to Physics website and client portal. Hand the whole folder to Claude Code.

Business: 1-to-1 tutoring, Year 1 reading through to A-level Maths & Science.
Domain: **phonicstophysics.com** · Tagline: *Small steps, big results.*

---

## What's in this folder

```
phonics-to-physics/
├── README.md              ← you are here (index + how to use)
├── BUILD_BRIEF.md         ← THE SPEC. Full requirements, stack, data model, phases.
├── brand/                 ← logo + brand assets (drop into the app)
│   ├── logo-primary.svg / .png   main horizontal logo (header, emails)
│   ├── logo-icon.svg / .png      badge only (square uses)
│   ├── favicon.ico + favicon-16/32/180/512.png   browser tab + app icon
│   └── social-banner.png         1200×630 Open Graph / link-preview image
└── reference/
    └── website-mockup.html       visual reference for look & feel (open in a browser)
```

**`BUILD_BRIEF.md` is the source of truth.** The mockup shows the intended style; the brand folder holds the real assets.

---

## Brand quick reference

Colours: Navy `#1F2D4A` · Coral `#F08A3E` (buttons) · Teal `#2E9C8E` (accent) · Gold `#F4B740` · Cream `#FBF5EC` (bg) · Line `#EADFCB` · Muted text `#6B7280`.
Type: serif for headings (e.g. Fraunces/Lora), clean sans for body (e.g. Inter).

## The model in one line

Pay-as-you-go **tokens** (1 token = one 55-min lesson), priced by tier (Primary £30 / Secondary £35 / A-level £40, 10% off a 10-pack). Clients buy tokens via **Stripe**, then **self-book** against Chris's availability via **Cal.com**; one token is spent per booking; free cancellation up to 24h. Full detail in the brief.

---

## Build status

- [x] **Phase 1 — Marketing site** implemented (landing, about, contact). Deploying to Vercel.
- [ ] **Phase 2 — Auth & shell** (login, protected dashboard/admin, role checks)
- [ ] **Phase 3 — Tokens & booking** (Stripe packs + Cal.com self-booking + token ledger) ← the core
- [ ] **Phase 4 — Dashboard modules** (targets, homework, messaging, calendar view)
- [ ] **Phase 5 — Admin polish & QA**

Work phase by phase — see §10 of the brief.

---

## How to use with Claude Code

Open this folder as your project (or copy it into your repo), then start with a prompt like:

> Read `BUILD_BRIEF.md` and `README.md`. Phase 1 is already built. Let's do **Phase 2** next: set up authentication and the protected dashboard/admin shell exactly as the brief specifies, using the recommended stack. Use the brand assets in `brand/` and match the style in `reference/website-mockup.html`. Before writing code, give me a short plan and list any accounts or env vars I need to set up.

Then repeat for each phase ("now Phase 3", etc.).

## Accounts you (Chris) set up — Claude Code can't do these for you

Stripe (6 token prices) · Cal.com (3 event types + webhooks) · an auth provider (Clerk/Supabase) · a database (Supabase/Neon) · Resend (email) · Vercel (Pro) · domain DNS. Details and the full `.env` list are in the brief (§8).
