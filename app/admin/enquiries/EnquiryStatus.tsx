"use client";

import { setEnquiryStatus } from "@/lib/admin-actions";

const styles: Record<string, string> = {
  new: "border-coral/50 bg-coral/10 text-coral-dark",
  contacted: "border-gold/60 bg-gold/10 text-navy-soft",
  converted: "border-teal bg-[#EAF7F4] text-teal",
  declined: "border-line bg-cream text-muted",
};

export function EnquiryStatus({ id, status }: { id: string; status: string }) {
  return (
    <form action={setEnquiryStatus}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`cursor-pointer rounded-pill border px-3 py-1 text-[13px] font-bold outline-none ${
          styles[status] ?? styles.new
        }`}
        aria-label="Enquiry status"
      >
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="converted">Converted</option>
        <option value="declined">Declined</option>
      </select>
    </form>
  );
}
