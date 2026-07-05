# Phonics to Physics — Website & Client Portal
## Build Brief for Claude Code

**Prepared for:** Chris (founder & tutor)
**Business:** Phonics to Physics — 1-to-1 tutoring, Year 1 reading through to A-level Maths & Science
**Domain:** phonicstophysics.com
**Tagline:** *Small steps, big results.*

---

## 1. What we're building (in one paragraph)

A small, professional marketing website (landing, about, contact) with a **private client portal**. Members of the public can read about the service and send an enquiry. When Chris agrees to take a client on, he sends them a **Stripe payment link**. Once they've paid, they get access to a **logged-in dashboard** where they can see their targets, lesson calendar, homework, message Chris, and pay future invoices. Chris has a simple **admin view** to manage clients, lessons, homework, targets, invoices and messages.

**Guiding principle:** Chris is a solo business owner, not a software company. Favour proven managed services (Stripe, a hosted auth provider) over hand-rolled auth and payments. Keep it secure, cheap to run, and easy to maintain.

---

## 2. Core user flow

```
Prospect visits site  →  reads About / Subjects  →  submits Contact form
        │
        ▼
Chris receives enquiry (email + shows in admin)  →  has intro call
        │
        ▼
Chris creates the client + sends a Stripe payment link
   (single lesson, weekly, or a prepaid block/package)
        │
        ▼
Client pays  →  Stripe webhook marks them "active"  →  account is provisioned
        │
        ▼
Client logs in  →  Dashboard: Targets · Calendar · Homework · Message Chris · Pay
```

**Important:** The account holder is the **parent/guardian** (most learners are children). The learner (the child) is a profile *under* the parent account. One parent may have multiple children.

---

## 3. Recommended tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | One codebase for site + portal + API routes; great DX; deploys easily. |
| Styling | **Tailwind CSS** | Fast, matches the component-based mockup already built. |
| Hosting | **Vercel** | Zero-config Next.js hosting; free/low tier is plenty at this scale. |
| Auth | **Clerk** (or Supabase Auth) | Managed login, password reset, email verification. Do **not** hand-roll auth. |
| Database | **Supabase (Postgres)** or **Neon + Prisma** | Stores clients, lessons, homework, targets, messages. |
| Payments | **Stripe** — Payment Links, Invoices, Customer Portal, Webhooks | Chris sends links; Stripe hosts the checkout; no card data touches our server. |
| Email | **Resend** (or Postmark) | Enquiry notifications + transactional emails. |
| Forms/spam | Server-side validation + honeypot + hCaptcha on contact form | Reduce spam enquiries. |

*Alternatives are fine if the builder prefers them, but keep the split: our code = branding + logic; managed services = auth + card handling.*

---

## 4. Design system

Use the brand assets and tokens below (files provided alongside this brief; also see the reference mockup `phonicstophysics-website.html`).

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
   - **Calendar** — upcoming and past lessons (date, time, subject, in-person/online, join link if online). Optionally request reschedule/cancel (sends Chris a message; no automatic changes).
   - **Homework** — assigned tasks with due dates, description, optional attachment, and a "mark as done" toggle.
   - **Message Chris** — simple threaded messaging between parent and Chris (not real-time chat; async, email-notified).
   - **Pay** — outstanding invoices with a "Pay now" button (Stripe), payment history/receipts, and a "Buy a lesson block" option for prepaid packages. Powered by Stripe Customer Portal + Invoices.

### Admin (Chris only)
7. **Admin dashboard** — manage clients & children; create/edit lessons on the calendar; set targets; assign homework; read/reply to messages; view enquiries; create Stripe payment links / invoices and see payment status. Keep it functional and simple. Protect via role check (Chris's account = `admin`).

---

## 6. Feature specifications

### 6.1 Authentication & access control
- Auth provider handles sign-up, login, email verification, password reset.
- **Accounts are provisioned by Chris/payment, not open self-registration.** Options:
  - Preferred: after first successful Stripe payment, the webhook creates (or invites) the user account tied to that email, and emails them a "set your password / log in" link.
  - Alternatively, Chris invites the parent from admin.
- Roles: `admin` (Chris), `client` (parent/guardian). Route protection: dashboard requires `client` or `admin`; admin area requires `admin`.
- A client with no active payment / expired package sees a gentle "your access is paused — contact Chris" state rather than full lockout.

### 6.2 Payments (Stripe) — pay-per-lesson **and** prepaid blocks
- **No public checkout.** Chris initiates payment after agreeing to take a client.
- Support two models:
  - **Pay per lesson:** Chris creates a Stripe **Payment Link** or **Invoice** for a single session or a week's sessions.
  - **Prepaid blocks/packages:** predefined products, e.g. *5-lesson block*, *10-lesson block*, at set prices. On purchase, credit the client's account with N lesson credits; decrement as lessons are marked complete; show remaining balance on the Pay tab.
- Use **Stripe Webhooks** (`checkout.session.completed`, `invoice.paid`, etc.) to: mark client active, provision/enable account, add lesson credits, record payment history.
- Use **Stripe Customer Portal** so clients can view receipts and manage saved cards without us building it.
- Store only Stripe IDs (customer id, payment intent id) — **never raw card data**.
- Currency: **GBP**.

### 6.3 Contact form → enquiry
- Server-side validation; honeypot + hCaptcha; rate-limit.
- On submit: persist enquiry, email Chris (Resend), auto-reply to the enquirer confirming receipt.
- Surface enquiries in the admin area with a status (new / contacted / converted / declined).

### 6.4 Dashboard modules (data-backed)
- **Targets:** admin CRUD; client read-only + celebratory UI when achieved.
- **Calendar:** admin creates lessons; client views; "request change" sends a message. (Optional future: sync to Google Calendar / integrate Cal.com for self-service booking.)
- **Homework:** admin assigns (title, description, due date, optional file); client toggles done; admin sees completion.
- **Messaging:** async threads keyed to a parent; email notification on new message; admin inbox.
- **Pay:** see §6.2.

---

## 7. Data model (starting point)

```
User            id, email, role(admin|client), auth_provider_id, created_at
Parent          id, user_id, name, phone
Child           id, parent_id, name, year_group, subjects[]
Lesson          id, child_id, starts_at, duration_min, subject, mode(online|in_person),
                join_url?, status(scheduled|completed|cancelled)
Target          id, child_id, title, detail, status(active|achieved), created_at
Homework        id, child_id, title, detail, due_date, attachment_url?, done(bool)
MessageThread   id, parent_id
Message         id, thread_id, sender(admin|client), body, created_at, read(bool)
Enquiry         id, parent_name, email, phone, year_group, subjects, mode, message,
                status(new|contacted|converted|declined), created_at
Payment         id, parent_id, stripe_customer_id, stripe_payment_id, type(lesson|block),
                amount_gbp, lesson_credits_added, created_at
LessonCredit    id, parent_id, child_id?, balance   (for prepaid blocks)
```

Adjust to the chosen ORM (Prisma schema recommended if using Neon/Prisma).

---

## 8. Third-party accounts & setup Chris needs to create

1. **Stripe** account (business details, bank account for payouts). Create products for lesson blocks.
2. **Auth provider** (Clerk or Supabase) project + API keys.
3. **Database** (Supabase / Neon) project + connection string.
4. **Resend** (or Postmark) account + verified sending domain (`phonicstophysics.com`).
5. **Vercel** account, connect the repo, add env vars.
6. **Domain**: register `phonicstophysics.com`, point DNS at Vercel.

### Environment variables (`.env.example` to include)
```
NEXT_PUBLIC_SITE_URL=
DATABASE_URL=
CLERK_PUBLISHABLE_KEY= / CLERK_SECRET_KEY=      # or SUPABASE keys
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
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

**Phase 1 — Marketing site.** Landing, About, Contact (with working enquiry email), legal pages, brand styling, responsive, OG/favicon, deploy to Vercel. *(The provided `phonicstophysics-website.html` is the visual reference.)*

**Phase 2 — Auth & shell.** Integrate auth provider; login; protected `/dashboard` and `/admin` routes with role checks; empty dashboard shell with the five tabs.

**Phase 3 — Payments.** Stripe integration: admin creates payment links/invoices; webhooks provision accounts and add lesson credits; client Pay tab + Customer Portal; prepaid block products.

**Phase 4 — Dashboard modules.** Targets, Calendar, Homework, Messaging — client views + admin CRUD.

**Phase 5 — Admin polish & QA.** Enquiries inbox, client management, testing, accessibility pass, launch.

---

## 11. Acceptance criteria (definition of done)

- [ ] Public site is responsive, on-brand, and scores well on Lighthouse (perf/a11y/SEO).
- [ ] Contact form emails Chris and auto-replies to the enquirer; spam-protected.
- [ ] A parent can only be created via Chris/payment; open self-signup is disabled.
- [ ] After a successful Stripe payment, the account is provisioned and the client can log in.
- [ ] Pay-per-lesson invoices and prepaid blocks both work; credits decrement correctly.
- [ ] Client dashboard shows Targets, Calendar, Homework, Messages, and Pay — each reading real data scoped to that parent's children only.
- [ ] Admin can CRUD lessons, targets, homework; reply to messages; see enquiries and payment status.
- [ ] No card data stored; all secrets in env vars; every API route enforces access control.
- [ ] Privacy Policy, Terms, and Safeguarding statement published.

---

## 12. Out of scope (v1) / nice-to-haves for later

- Self-service public booking (later: integrate **Cal.com** or Google Calendar for clients to pick slots themselves).
- Automated recurring subscriptions (add later if Chris wants monthly plans).
- Video lessons in-app (use Zoom/Meet links in the Calendar for now).
- Progress-report PDF generation and parent email digests.
- Multi-tutor support (if the business grows beyond Chris).

---

## Reference copy (ready to use)

**About Chris:** "I've spent the last several years tutoring students of every age and stage — from helping five-year-olds sound out their first words, to guiding A-level students through calculus and mechanics. I believe every child can thrive with the right support, patience and a bit of fun. My approach is warm, structured and tailored to each learner: we find where the gaps are, set clear goals, and celebrate the wins along the way. Parents get honest updates so you always know how things are going."

**Subjects:** Learning to Read (phonics & early reading, Year 1+) · Maths (Year 1 to A-level) · GCSE Science (Biology, Chemistry, Physics).

**Trust badges:** DBS checked · Online or in person · Y1–A-level · Free intro call.
