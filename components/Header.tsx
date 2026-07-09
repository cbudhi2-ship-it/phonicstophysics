"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { nav } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-wrap items-center justify-between px-6 py-3.5">
        <Link href="/" aria-label="Phonics to Physics home">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-pill px-3.5 py-2 text-[15px] font-semibold transition-shadow hover:bg-white hover:shadow-soft ${
                isActive(item.href) ? "bg-white shadow-soft" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/login" className="btn btn-ghost ml-1 !py-2">
            Log in
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-xl leading-none">{open ? "✕" : "☰"}</span>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-cream px-6 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3.5 py-2.5 font-semibold ${
                  isActive(item.href) ? "bg-white shadow-soft" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="btn btn-ghost mt-2 w-full"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
