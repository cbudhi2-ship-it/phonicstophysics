import Link from "next/link";
import { Logo } from "@/components/Logo";
import { logout } from "@/lib/actions";

export function PortalHeader({
  name,
  homeHref,
  badge,
}: {
  name: string | null;
  homeHref: string;
  badge?: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-wrap items-center justify-between px-6 py-3.5">
        <Link href={homeHref} aria-label="Phonics to Physics">
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          {badge && (
            <span className="hidden rounded-pill bg-navy px-3 py-1 text-[12px] font-bold text-white sm:inline">
              {badge}
            </span>
          )}
          {name && (
            <span className="hidden text-[14px] font-semibold text-navy-soft sm:inline">
              {name}
            </span>
          )}
          <Link
            href="/account/password"
            className="hidden text-[14px] font-semibold text-teal hover:underline sm:inline"
          >
            Account
          </Link>
          <form action={logout}>
            <button type="submit" className="btn btn-ghost !py-2 text-[14px]">
              Log out
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
