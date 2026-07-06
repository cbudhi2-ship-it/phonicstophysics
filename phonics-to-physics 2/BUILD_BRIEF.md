# Phonics to Physics — Website & Client Portal
## Build Brief for Claude Code

**Prepared for:** Chris (founder & tutor)
**Business:** Phonics to Physics — 1-to-1 tutoring, Year 1 reading through to A-level Maths & Science
**Domain:** phonicstophysics.com
**Tagline:** *Small steps, big results.*

---

## 1. What we're building (in one paragraph)

A small, professional marketing website (landing, about, contact) with a **private client portal** built around a low-friction, **pay-as-you-go token model**. Members of the public can read about the service and send an enquiry. After a free intro call, Chris enables the account; the client can then **buy tokens** (prepaid lesson credits) via Stripe and **self-book** lessons against Chris's live availability (Cal.com), with **one token spent per booking**. No subscription, no invoice-chasing, no lock-in. The **logged-in dashboard** shows targets, lesson calendar, homework, a message-Chris channel, and their token balance + booking. Chris has a simple **admin view** to manage clients, lessons, homework, targets, tokens and messages.

**Design goal — "no stickiness for the client":** pay only for what you use, book yourself, stop any time. Tokens can be bought singly or in discounted packs.

**Guiding principle:** Chris is a solo business owner, not a software company. Favour proven managed services (Stripe, a hosted auth provider) over hand-rolled auth and payments. Keep it secure, cheap to run, and easy to maintain.

---

## 2. Core user flow

```
Prospect visits site  →  reads About / Subjects  →  submits Contact form
        │
        ▼
Chris receives enquiry (email + admin)  →  free intro call (fit, level, safeguarding)
        │
        ▼
Chris ENABLES the account  →  client can now buy tokens & self-book
        │
        ▼
Client buys a token pack (Stripe Checkout)  →  tokens credited to their balance
        │
        ▼
Client opens live availability (Cal.com embed)  →  books a slot  →  1 token deducted
        │
        ▼
Attend lesson.  Cancel/reschedule >24h  →  token refunded.
                Late cancel / no-show     →  token spent.
        │
        ▼
Dashboard: Targets · Calendar · Homework · Message Chris · Tokens & Booking
```

**Two-tier access (keeps a safeguarding gate at the front door):**
- **New enquiry:** must have an intro call before Chris enables buying/booking. No cold self-signup.
- **Enabled client:** fully self-serve forever — buy tokens, book, cancel, all without Chris's involvement.

**Important:** The account holder is the **parent/guardian** (most learners are children). The learner (the child) is a profile *under* the parent account. One parent may have multiple children. Tokens belong to the parent account and can be used for any of their children.

---

## 3. Recommended tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | One codebase for site + portal + API routes; great DX; deploys easily. |
| Styling | **Tailwind CSS** | Fast, matches the component-based mockup already built. |
| Hosting | **Vercel** | Zero-config Next.js hosting; free/low tier is plenty at this scale. |
| Auth | **Clerk** (or Supabase Auth) | Managed login, password reset, email verification. Do **not** hand-roll auth. |
| Database | **Supabase (Postgres)** or **Neon + Prisma** | Stores clients, lessons, homework, targets, messages. |
| Payments | **Stripe** — Checkout (token packs), Customer Portal, Webhooks | Client buys token packs; Stripe hosts checkout; no card data touches our server. |
| Scheduling | **Cal.com** (free tier: unlimited event types + API/webhooks), embedded | Client self-books against Chris's live availability inside our own site; webhook tells us to spend a token. |
| Email | **Resend** (or Postmark) | Enquiry notifications + transactional emails. |
| Forms/spam | Server-side validation + honeypot + hCaptcha on contact form | Reduce spam enquiries. |

*Alternatives are fine if the builder prefers them, but keep the split: our code = branding + logic; managed services = auth + card handling.*

---

## 4. Design system

Use the brand assets and tokens below (files in the **`brand/`** folder; also see the reference mockup **`reference/website-mockup.html`**).

### Colours
| Token | Hex | Use |
|---|---|---|
| Navy | `#1F2D4A` | Primary text, headings, dark UI |
| Coral | `#F08A3E` | Primary buttons / calls-to-action |
| Coral (dark) | `#E0762A` | Button hover |
| Teal | `#2E9C8E` | Secondary accent, links, "Physics" |
| Gold | `#F4B740` | Highlights, the "star" |
| Cream | `#FBF5EC` | Page background |
| Card | `#FFFFFF` | Cards/surfaces |
| Line | `#EADFCB` | Borders/dividers |
| Muted | `#6B7280` | Secondary text |

### Typography
- **Headings / wordmark:** a serif — Georgia in the mockup; use a web font like **Fraunces** or **Lora** for production.
- **Body / UI:** a clean sans — **Inter** or system sans.
- Tone: warm, friendly, reassuring for parents; not corporate.

### Logo assets (provided)
- `logo-primary.svg` / `logo-primary.png` — main horizontal lockup (header, emails).
- `logo-icon.svg` / `logo-icon.png` — badge only (square uses).
- `favicon.ico` + `favicon-16/32/180/512.png` — browser tab + app icon (dark version).
- `social-banner.png` — 1200×630 Open Graph image for link previews.

The mark is "The Journey": a coral dot climbing a dotted teal path past milestones to a gold star. Feel free to animate the path drawing-in on the landing hero.

---

## 5. Site map & pages

### Public (no login)
1. **Landing / Home** — hero (headline, tagline, CTA "Book a free intro call"), trust strip (years tutoring, ages covered, DBS checked), subjects overview (Reading & Phonics, Maths Y1–A-level, GCSE Science), short about teaser, testimonials placeholder, footer.
2. **About** — Chris's bio (copy below), approach, credentials/badges, photo. Reassurance for parents.
3. **Contact / Enquire** — enquiry form: parent name, email, phone, child's year group, subject(s) of interest, in-person or online, message. On submit → email Chris + store enquiry + show a friendly confirmation. Include honeypot + hCaptcha.
4. **Login** — email/password (Clerk-hosted or embedded). "Forgot password" handled by auth provider.
5. **Legal** — Privacy Policy, Terms, and a short Safeguarding statement (see §9).

### Private (client, after payment)
6. **Dashboard** (parent/guardian view, per child):
   - **Targets** — current learning goals Chris has set for the child, with status (working on / achieved).
   - **Calendar** — upcoming and past lessons (date, time, subject, in-person/online, join link if online), pulled from Cal.com bookings. Self-serve reschedule/cancel per the 24h policy, which automatically refunds or spends a token.
   - **Homework** — assigned tasks with due dates, description, optional attachment, and a "mark as done" toggle.
   - **Message Chris** — simple threaded messaging between parent and Chris (not real-time chat; async, email-notified).
   - **Tokens & Booking** — current token balance, "Buy tokens" (single or discounted packs via Stripe), "Book a lesson" (opens the Cal.com booking embed — only enabled when balance > 0), and a transaction history (purchases, bookings, refunds). Receipts via Stripe Customer Portal.

### Admin (Chris only)
7. **Admin dashboard** — manage clients & children; **enable/disable** accounts after the intro call; set availability in Cal.com; set targets; assign homework; read/reply to messages; view enquiries; see each client's **token balance and transaction history**, and manually adjust tokens (e.g. goodwill credit, referral reward). Keep it functional and simple. Protect via role check (Chris's account = `admin`). Availability itself is managed in the Cal.com dashboard; the admin area links out to it.

---

## 6. Feature specifications

### 6.1 Authentication & access control
- Auth provider handles sign-up, login, email verification, password reset.
- **Accounts are provisioned by Chris/payment, not open self-registration.** Options:
  - Preferred: after first successful Stripe payment, the webhook creates (or invites) the user account tied to that email, and emails them a "set your password / log in" link.
  - Alternatively, Chris invites the parent from admin.
- Roles: `admin` (Chris), `client` (parent/guardian). Route protection: dashboard requires `client` or `admin`; admin area requires `admin`.
- A client with no active payment / expired package sees a gentle "your access is paused — contact Chris" state rather than full lockout.

### 6.2 Tokens, booking & payments (Stripe + Cal.com)

The heart of the product. A **token = one prepaid lesson credit.** Clients buy tokens, then spend them booking their own slots.

**Three token tiers (priced by level).** All lessons are **55 min**; price depends on the learner's level. A token is **tier-specific** — you buy and spend tokens of the matching tier, and a parent with children at different levels holds a **separate balance per tier**. Buying ten gives a **10% discount**.

| Tier | Year groups (default) | 1 token | 10-token pack | Effective /lesson |
|---|---|---|---|---|
| `primary` | Reception – Year 6 | £30 | £270 | £27 |
| `secondary` | Year 7 – 11 (incl. GCSE) | £35 | £315 | £31.50 |
| `a_level` | Year 12 – 13 | £40 | £360 | £36 |

- A child's `year_group` maps to their tier automatically (admin can override per child).
- Each tier maps to its **own Cal.com event type** (all 55 min) and its **own Stripe prices**.
- A **5-token pack** per tier can be added later; launch with 1 and 10.

**Buying tokens (Stripe Checkout).**
- Six Stripe prices at launch: {primary, secondary, a_level} × {1, 10}. Currency **GBP**.
- Client buys from the **Tokens & Booking** tab → Stripe Checkout (hosted) → return to dashboard. The chosen tier + quantity travel as Checkout metadata.
- **Stripe webhook** `checkout.session.completed` credits the purchased tokens **to that tier's balance** and writes a `TokenTransaction` (type `purchase`, with `tier`). Idempotent on the Stripe session id.
- Only **enabled** accounts can buy (gate in the UI + server check).

**Booking a lesson (Cal.com).**
- The client picks **which child** the lesson is for; the child's tier selects the correct **Cal.com event type** (primary / secondary / a_level, all 55 min).
- "Book a lesson" is enabled only when **that tier's balance > 0**. It opens the **Cal.com embed** for the tier's event type, scoped to Chris's availability.
- On a confirmed booking, **Cal.com webhook** `BOOKING_CREATED` hits our endpoint → we **deduct 1 token of that tier** (`TokenTransaction` type `booking`, with `tier`, linked to the Cal.com booking id) and store a `Booking` row.
- Guard against overbooking: re-check the tier balance server-side when the webhook arrives; if somehow zero (race), auto-cancel the Cal.com booking via API and notify the client to buy more tokens.

**Cancellation & reschedule policy (enforced in code).**
- **>24h before start:** cancel → refund 1 token (`TokenTransaction` type `refund`); reschedule → keep the same token, move the booking.
- **≤24h / no-show:** token is spent, no refund.
- Cal.com webhooks `BOOKING_CANCELLED` / `BOOKING_RESCHEDULED` drive this; compute the time delta server-side (don't trust the client).

**Token expiry.** Tokens expire **6 months** after purchase (configurable). Surface expiry dates in the transaction history; run a scheduled job to expire stale tokens (`TokenTransaction` type `expiry`). Keep the policy clearly stated in Terms (UK consumer-fairness).

**Balance = sum of the ledger, per tier.** Never store a mutable "balance" integer as the source of truth; compute each tier's balance from the append-only `TokenTransaction` ledger filtered by `tier` (purchase +, booking −, refund +, adjustment ±, expiry −). The dashboard shows a balance per tier the parent actually holds. This makes disputes auditable.

**Refunds & receipts.** Use **Stripe Customer Portal** for receipts/card management. Money refunds (rare) are handled by Chris in the Stripe dashboard; a corresponding token adjustment is made in admin.

**Store only Stripe/Cal.com IDs — never raw card data.**

### 6.3 Contact form → enquiry
- Server-side validation; honeypot + hCaptcha; rate-limit.
- On submit: persist enquiry, email Chris (Resend), auto-reply to the enquirer confirming receipt.
- Surface enquiries in the admin area with a status (new / contacted / converted / declined).

### 6.4 Dashboard modules (data-backed)
- **Targets:** admin CRUD; client read-only + celebratory UI when achieved.
- **Calendar:** driven by Cal.com bookings (see §6.2). Client sees upcoming/past lessons and can self-serve reschedule/cancel under the 24h policy; Chris manages availability in Cal.com. Our DB mirrors bookings via webhook for display and token accounting.
- **Homework:** admin assigns (title, description, due date, optional file); client toggles done; admin sees completion.
- **Messaging:** async threads keyed to a parent; email notification on new message; admin inbox.
- **Pay:** see §6.2.

---

## 7. Data model (starting point)

```
User             id, email, role(admin|client), auth_provider_id,
                 status(pending|enabled|paused), stripe_customer_id?, created_at
Parent           id, user_id, name, phone
Child            id, parent_id, name, year_group,
                 tier(primary|secondary|a_level),   # auto from year_group, admin-overridable
                 subjects[]
Booking          id, parent_id, child_id, tier, cal_booking_uid, starts_at, duration_min,
                 subject, mode(online|in_person), join_url?,
                 status(scheduled|completed|cancelled|rescheduled), created_at
Target           id, child_id, title, detail, status(active|achieved), created_at
Homework         id, child_id, title, detail, due_date, attachment_url?, done(bool)
MessageThread    id, parent_id
Message          id, thread_id, sender(admin|client), body, created_at, read(bool)
Enquiry          id, parent_name, email, phone, year_group, subjects, mode, message,
                 status(new|contacted|converted|declined), created_at

# --- Tokens: append-only ledger; balance per tier = SUM(amount) of non-expired rows ---
TokenTransaction id, parent_id,
                 tier(primary|secondary|a_level),
                 type(purchase|booking|refund|adjustment|expiry),
                 amount(int, + or -),
                 stripe_session_id?,          # for purchases (idempotency)
                 cal_booking_uid?,            # for booking/refund
                 pack_label?,                 # e.g. "Primary 10-token pack"
                 expires_at?,                 # for purchase rows
                 note?,                       # for admin adjustments
                 created_at
```

**Balance is per (parent, tier)** — computed from `TokenTransaction`, never stored as a mutable field. Purchases carry an `expires_at`; a scheduled job writes `expiry` rows when packs lapse. All webhook writes are **idempotent** keyed on `stripe_session_id` / `cal_booking_uid`.

Adjust to the chosen ORM (Prisma schema recommended if using Neon/Prisma).

---

## 8. Third-party accounts & setup Chris needs to create

1. **Stripe** account (business details, bank account for payouts). Create **6 prices**: primary/secondary/a_level × 1-token/10-token (see §6.2 for amounts). GBP.
2. **Cal.com** account (free tier). Create **three 55-min event types** (Primary, Secondary, A-level lesson), connect Chris's Google/other calendar, set weekly availability, generate an **API key** and set up **webhooks** (`BOOKING_CREATED`, `BOOKING_CANCELLED`, `BOOKING_RESCHEDULED`) pointing at our endpoint.
3. **Auth provider** (Clerk or Supabase) project + API keys.
4. **Database** (Supabase / Neon) project + connection string.
5. **Resend** (or Postmark) account + verified sending domain (`phonicstophysics.com`).
6. **Vercel** account (Pro), connect the repo, add env vars.
7. **Domain**: `phonicstophysics.com` DNS pointed at Vercel.

### Environment variables (`.env.example` to include)
```
NEXT_PUBLIC_SITE_URL=
DATABASE_URL=
CLERK_PUBLISHABLE_KEY= / CLERK_SECRET_KEY=      # or SUPABASE keys
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
# Stripe price IDs — one per tier per pack size
STRIPE_PRICE_PRIMARY_1=
STRIPE_PRICE_PRIMARY_10=
STRIPE_PRICE_SECONDARY_1=
STRIPE_PRICE_SECONDARY_10=
STRIPE_PRICE_ALEVEL_1=
STRIPE_PRICE_ALEVEL_10=
CALCOM_API_KEY=
CALCOM_WEBHOOK_SECRET=
# Cal.com 55-min event URL per tier (to embed)
NEXT_PUBLIC_CALCOM_EVENT_PRIMARY=
NEXT_PUBLIC_CALCOM_EVENT_SECONDARY=
NEXT_PUBLIC_CALCOM_EVENT_ALEVEL=
TOKEN_EXPIRY_MONTHS=6
CANCEL_WINDOW_HOURS=24
RESEND_API_KEY=
CONTACT_NOTIFY_EMAIL=            # Chris's inbox for enquiries
HCAPTCHA_SECRET=
```

---

## 9. Security, privacy & safeguarding (do not skip — clients are children)

- **GDPR (UK):** collect only necessary data; publish a Privacy Policy; provide a way to request data deletion. Account holders are adults (parents/guardians); children's data is minimal (first name, year group, targets, homework).
- **Safeguarding:** include a short safeguarding statement; do not expose children's personal data publicly; messaging is parent↔Chris only.
- **Payments:** PCI handled entirely by Stripe (hosted checkout / portal). Never store card data.
- **Auth:** rely on the managed provider for password hashing, MFA option, session management.
- **Transport:** HTTPS everywhere (Vercel default). Secure, http-only cookies for sessions.
- **Access checks** on every API route and dashboard page (a client can only ever see their own children's data).
- Rate-limit the contact form and login.

---

## 10. Suggested build phases (so Claude Code can work incrementally)

**Phase 1 — Marketing site.** Landing, About, Contact (with working enquiry email), legal pages, brand styling, responsive, OG/favicon, deploy to Vercel. *(`reference/website-mockup.html` is the visual reference.)*

**Phase 2 — Auth & shell.** Integrate auth provider; login; protected `/dashboard` and `/admin` routes with role checks; empty dashboard shell with the five tabs.

**Phase 3 — Tokens & booking (the core).** Stripe Checkout for token packs + webhook crediting; `TokenTransaction` ledger + computed balance; Cal.com embed for self-booking gated on balance; Cal.com webhooks to deduct/refund tokens; 24h cancellation logic; token expiry job; Tokens & Booking tab + Stripe Customer Portal.

**Phase 4 — Dashboard modules.** Targets, Homework, Messaging, and the Calendar view of Cal.com bookings — client views + admin CRUD.

**Phase 5 — Admin polish & QA.** Enquiries inbox, client management, testing, accessibility pass, launch.

---

## 11. Acceptance criteria (definition of done)

- [ ] Public site is responsive, on-brand, and scores well on Lighthouse (perf/a11y/SEO).
- [ ] Contact form emails Chris and auto-replies to the enquirer; spam-protected.
- [ ] Open self-signup is disabled; accounts are only `enabled` by Chris after an intro call.
- [ ] Buying a token pack via Stripe credits the correct number of tokens **to the right tier** (idempotently); each tier's balance is computed from the ledger.
- [ ] Booking for a child uses that child's **tier** event type and price; "Book a lesson" is disabled when that tier's balance is zero; a confirmed booking deducts exactly one token of that tier.
- [ ] Cancel/reschedule >24h refunds the token; ≤24h or no-show spends it — enforced server-side.
- [ ] Tokens expire per `TOKEN_EXPIRY_MONTHS`; expiry is reflected in the balance and transaction history.
- [ ] Client dashboard shows Targets, Calendar, Homework, Messages, and Tokens & Booking — each reading real data scoped to that parent's children only.
- [ ] Admin can enable/disable accounts, CRUD targets/homework, reply to messages, see enquiries, and view/adjust token balances.
- [ ] No card data stored; all Stripe & Cal.com webhooks verify signatures; all secrets in env vars; every API route enforces access control.
- [ ] Privacy Policy, Terms, and Safeguarding statement published.

---

## 12. Out of scope (v1) / nice-to-haves for later

- Automated recurring subscriptions / monthly plans (the token model is deliberately pay-as-you-go; add later only if wanted).
- Second token tier for tiered pricing by level (launch flat; add `a_level` token type later if needed).
- Referral rewards (referrer earns a token when a referred friend pays — reuses the Stripe webhook + token ledger; spec on request).
- Video lessons in-app (use Zoom/Meet links from Cal.com for now).
- Progress-report PDF generation and parent email digests.
- Multi-tutor support (if the business grows beyond Chris).

---

## Reference copy (ready to use)

**About Chris:** "I've spent the last several years tutoring students of every age and stage — from helping five-year-olds sound out their first words, to guiding A-level students through calculus and mechanics. I believe every child can thrive with the right support, patience and a bit of fun. My approach is warm, structured and tailored to each learner: we find where the gaps are, set clear goals, and celebrate the wins along the way. Parents get honest updates so you always know how things are going."

**Subjects:** Learning to Read (phonics & early reading, Year 1+) · Maths (Year 1 to A-level) · GCSE Science (Biology, Chemistry, Physics).

**Trust badges:** DBS checked · Online or in person · Y1–A-level · Free intro call.

**Pricing (public-facing, per 55-min lesson):**
- Primary (Reception–Y6): **£30**, or **£270 for 10** (save £30).
- Secondary (Y7–11, incl. GCSE): **£35**, or **£315 for 10** (save £35).
- A-level (Y12–13): **£40**, or **£360 for 10** (save £40).

*All packs = 10% off. Book your own slots online; cancel free up to 24h before.*
