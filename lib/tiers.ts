import { yearGroups } from "@/lib/enquiry";

export type Tier = "primary" | "secondary" | "a_level";

export const tierLabel: Record<Tier, string> = {
  primary: "Primary",
  secondary: "Secondary",
  a_level: "A-level",
};

/** Map a year group to its pricing tier (admin can override later). */
export function tierForYearGroup(yg: string): Tier {
  const secondary = [
    "Year 7",
    "Year 8",
    "Year 9",
    "GCSE (Year 10–11)",
  ];
  const aLevel = ["A-level (Year 12–13)"];
  if (aLevel.includes(yg)) return "a_level";
  if (secondary.includes(yg)) return "secondary";
  // Reception–Y6 and anything unknown default to primary.
  return "primary";
}

export const childYearGroups = yearGroups;
