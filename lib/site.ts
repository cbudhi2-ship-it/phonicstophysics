export const site = {
  name: "Phonics to Physics",
  tagline: "Small steps, big results.",
  description:
    "Patient, one-to-one tutoring for children who are finding school a struggle — including SEND learners in mainstream school. From learning to read in Year 1 through to GCSE and A-level.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://phonicstophysics.com",
  email: "hello@phonicstophysics.com",
  phone: "07584 030444",
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/subjects", label: "Subjects" },
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
  "SEND-trained (The National College)",
  "DBS checked",
  "Online or in person",
  "Year 1–A-level",
] as const;

/** "Who I help" — the children this practice is built for. */
export const whoIHelp = [
  "Have fallen behind and lost confidence",
  "Find a subject a real struggle, however hard they try",
  "Need learning broken down and explained differently",
  "Are SEND learners in mainstream school who need extra, individual support — including dyslexia, ADHD, working-memory or processing difficulties, or anxiety around a subject",
  "Simply need a calmer, one-to-one pace than a busy classroom allows",
] as const;

/** "How I work" — the approach, in order. */
export const howIWork = [
  {
    title: "I start by understanding your child",
    detail:
      "Where they are, what they find hard, and what makes them switch off or shut down.",
  },
  {
    title: "We go at their pace",
    detail: "No pressure, no rushing to keep up with anyone else.",
  },
  {
    title: "I build confidence first",
    detail: "Small early wins matter more than anything.",
  },
  {
    title: "I explain it differently until it clicks",
    detail: "There's always another way in.",
  },
  {
    title: "I keep you in the loop",
    detail: "Honest, jargon-free updates so you always know how things are going.",
  },
  {
    title: "I work alongside school",
    detail: "Supporting what your child is already doing in class.",
  },
] as const;

export const testimonials = [
  {
    quote:
      "Chris has been tutoring my daughter for over three years now and you could not wish for a more conscientious person. He has guided my daughter through every exam, mock and finally her GCSE exams this year. Chris will research what topic is being covered and obtain links to websites that can assist. He will work through past papers and his patience is outstanding. He would give my daughter all the thinking time she required and found ways to explain things to her. Chris was not just my daughter’s tutor but became a friend to us all. You could not ask for a more professional tutor.",
    name: "Julie Bishop",
    role: "Parent · 3 years of tutoring to GCSE",
  },
  {
    quote:
      "I’d definitely recommend Chris to anyone who needs help with maths. He helped me remember the maths skills I needed for my university interviews and explained everything in a way that actually made sense. He was really patient and never made me feel silly for asking questions. I felt so much more confident, and I went into my interviews feeling much better prepared. Thank you so much for all your help — I really appreciate it!",
    name: "Zara Bishop",
    role: "University interview preparation",
  },
] as const;
