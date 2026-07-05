export const site = {
  name: "Phonics to Physics",
  tagline: "Small steps, big results.",
  description:
    "Friendly 1-to-1 tutoring from Year 1 phonics all the way to A-level Maths and Science. Building confidence one lesson at a time.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://phonicstophysics.com",
  email: "hello@phonicstophysics.com",
  phone: "07xxx xxx xxx",
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/subjects", label: "Subjects" },
  { href: "/contact", label: "Contact" },
] as const;

export const subjects = [
  {
    icon: "📖",
    iconBg: "#FFE9CF",
    title: "Learning to Read",
    blurb:
      "Phonics, early reading and comprehension for Year 1 upward — building strong foundations and a love of books.",
  },
  {
    icon: "➗",
    iconBg: "#FCEFC7",
    title: "Maths, Y1 to A-level",
    blurb:
      "From times tables and SATs to GCSE and A-level — arithmetic, algebra, calculus and exam technique.",
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
  "Online or in person",
  "Y1–A-level",
  "Free intro call",
] as const;
