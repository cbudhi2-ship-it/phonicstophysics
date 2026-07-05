import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 bg-navy py-9 text-[#D7DEEC]">
      <div className="wrap flex flex-wrap items-start justify-between gap-6">
        <div>
          <b className="font-serif text-white">Phonics to Physics</b>
          <br />
          <span className="text-[13px]">{site.tagline}</span>
          <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/safeguarding" className="hover:text-white">
              Safeguarding
            </Link>
          </nav>
        </div>
        <div className="text-[13px] md:text-right">
          {site.email} · {site.phone}
          <br />© {new Date().getFullYear()} Phonics to Physics · DBS checked
          tutor
        </div>
      </div>
    </footer>
  );
}
