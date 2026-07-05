import Link from "next/link";
import { JourneyMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <section className="py-24">
      <div className="wrap max-w-[520px] text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-line bg-white shadow-soft">
          <JourneyMark size={48} />
        </div>
        <h1 className="text-[40px]">Page not found</h1>
        <p className="mt-3 text-[17px] text-navy-soft">
          Sorry — we couldn&apos;t find that page. Let&apos;s get you back on the
          path.
        </p>
        <Link href="/" className="btn btn-primary mt-6">
          Back to home
        </Link>
      </div>
    </section>
  );
}
