export const site = {
  name: "Phonics to Physics",
  tagline: "Small steps, big results.",
  description:
    "Friendly 1-to-1 tutoring from Year 1 phonics all the way to A-level Maths and Science. Building confidence one lesson at a time.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://phonicstophysics.com",
  email: "hello@phonicstophysics.com",
  phone: "07584 030444",
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/subjects", label: "Subjects" },
  { href: "/bootcamp", label: "11+ Bootcamp" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * Public-facing pricing — one token = one 55-min lesson, priced by tier.
 * Packs of 10 are 10% off. Kept in sync with BUILD_BRIEF §6.2 / reference copy.
 */
export const pricing = [
  {
    tier: "Primary",
    years: "Reception – Year 6",
    single: 30,
    pack: 270,
    save: 30,
    iconBg: "#FFE9CF",
  },
  {
    tier: "Secondary",
    years: "Year 7 – 11 (incl. GCSE)",
    single: 35,
    pack: 315,
    save: 35,
    iconBg: "#FCEFC7",
  },
  {
    tier: "A-level",
    years: "Year 12 – 13",
    single: 40,
    pack: 360,
    save: 40,
    iconBg: "#D5F0EA",
  },
] as const;

export const subjects = [
  {
    icon: "📖",
    iconBg: "#FFE9CF",
    title: "Reading & English",
    blurb:
      "From phonics and early reading to comprehension, grammar and writing — building strong foundations, confidence and a love of books.",
  },
  {
    icon: "➗",
    iconBg: "#FCEFC7",
    title: "Maths, Y1 to A-level",
    blurb:
      "From times tables and SATs to GCSE and A-level — arithmetic, algebra and exam technique.",
  },
  {
    icon: "🔬",
    iconBg: "#D5F0EA",
    title: "GCSE Science",
    blurb:
      "Biology, Chemistry and Physics made clear — with practical explanations and past-paper practice.",
  },
] as const;

export const trustBadges = [
  "DBS checked",
  "Online or in-person (Cambridge)",
  "Y1–A-level",
  "Free intro call",
] as const;

export const testimonials = [
  {
    quote:
      "I’d definitely recommend Chris to anyone who needs help with maths. He helped me remember the maths skills I needed for my university interviews and explained everything in a way that actually made sense. He was really patient and never made me feel silly for asking questions. I felt so much more confident, and I went into my interviews feeling much better prepared. Thank you so much for all your help — I really appreciate it!",
    name: "Zara Bishop",
    role: "University interview preparation",
  },
] as const;
