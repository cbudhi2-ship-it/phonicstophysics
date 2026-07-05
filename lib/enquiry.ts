import { z } from "zod";

export const yearGroups = [
  "Reception / pre-school",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
  "Year 7",
  "Year 8",
  "Year 9",
  "GCSE (Year 10–11)",
  "A-level (Year 12–13)",
  "Other / not sure",
] as const;

export const subjectOptions = [
  "Reading & Phonics",
  "Maths",
  "GCSE Science",
  "Other",
] as const;

export const modeOptions = ["Online", "In person", "Either"] as const;

export const enquirySchema = z.object({
  // Honeypot: must stay empty. Bots fill it in.
  company: z.string().max(0).optional().or(z.literal("")),
  parentName: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  yearGroup: z.enum(yearGroups, {
    message: "Please choose a year group",
  }),
  subjects: z
    .array(z.enum(subjectOptions))
    .min(1, "Please choose at least one subject"),
  mode: z.enum(modeOptions),
  message: z.string().trim().min(5, "Please add a short message").max(2000),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
