export const bootcamp = {
  title: "Complete 11+ Summer Bootcamp",
  tagline:
    "Daily live online lessons this August — the whole exam, small group, timed for the September grammar sit.",
  datesLabel: "Mon–Fri · 3–28 August 2026",
  timeLabel: "9:30–10:30am",
  earlyBirdPrice: 199,
  standardPrice: 249,
  // Early-bird ends end of 17 July 2026 (UK).
  earlyBirdDeadlineISO: "2026-07-17T22:59:59Z",
  earlyBirdDeadlineLabel: "17 July",
} as const;

export function isEarlyBird(now: number = Date.now()): boolean {
  return now <= Date.parse(bootcamp.earlyBirdDeadlineISO);
}

export function bootcampPrice(now?: number): number {
  return isEarlyBird(now) ? bootcamp.earlyBirdPrice : bootcamp.standardPrice;
}

export function bootcampPriceEnv(now?: number): string {
  return isEarlyBird(now)
    ? "STRIPE_PRICE_BOOTCAMP_EARLYBIRD"
    : "STRIPE_PRICE_BOOTCAMP_STANDARD";
}

export const bootcampWeek = [
  { day: "Mon", focus: "English", detail: "Comprehension, vocabulary, spelling & grammar" },
  { day: "Tue", focus: "Maths", detail: "Arithmetic fluency, word problems, topic of the week" },
  { day: "Wed", focus: "Verbal Reasoning", detail: "Codes, letter/word logic, sequences" },
  { day: "Thu", focus: "Non-Verbal Reasoning", detail: "Shapes, rotations, patterns, matrices" },
  { day: "Fri", focus: "Mixed timed practice", detail: "Exam-style questions under time + group review" },
] as const;

export const bootcampWeeks = [
  { label: "Week 1 · 3–7 Aug", detail: "Foundations & technique in each component; get the routine going." },
  { label: "Week 2 · 10–14 Aug", detail: "Core skills; timing introduced on Fridays." },
  { label: "Week 3 · 17–21 Aug", detail: "Harder questions; exam strategy and time management." },
  { label: "Week 4 · 24–28 Aug", detail: "Full timed mock midweek + walkthrough; last-minute confidence." },
] as const;

export const bootcampFaq = [
  { q: "What level is it for?", a: "Children entering Year 6, sitting the September state-grammar 11+." },
  { q: "What if we're on holiday for a few days?", a: "Every session is recorded — your child can catch up any time." },
  { q: "Which exam board?", a: "It covers the core GL/CEM-style skills. Tell me your target schools and I'll flag anything specific." },
  { q: "How big is the group?", a: "Capped to stay small and interactive, so every child gets attention." },
  { q: "Refunds?", a: "Full refund up to 7 days before the start date." },
  { q: "Is it safe / online?", a: "DBS-checked tutor, private join link with a waiting room, cameras optional, and parents cc'd on all comms." },
] as const;

export const bootcampIncludes = [
  "20 live sessions (Mon–Fri for 4 weeks)",
  "Every session recorded",
  "Downloadable weekly workbooks",
  "Short daily homework",
  "A full timed mock + feedback",
] as const;
