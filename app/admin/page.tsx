import Link from "next/link";

type Section = {
  icon: string;
  title: string;
  desc: string;
  href?: string;
  external?: boolean;
};

const sections: Section[] = [
  {
    icon: "👥",
    title: "Clients & children",
    desc: "Add clients, manage children, set targets & homework, and adjust lesson balances. Open a client to manage them.",
    href: "/admin/clients",
  },
  {
    icon: "💬",
    title: "Messages",
    desc: "Parent message threads in one inbox — newest first, with unread flags.",
    href: "/admin/messages",
  },
  {
    icon: "✉️",
    title: "Enquiries",
    desc: "New enquiries from the contact form, with status tracking.",
    href: "/admin/enquiries",
  },
  {
    icon: "📅",
    title: "Availability",
    desc: "Set your bookable hours (opens Cal.com).",
    href: "https://app.cal.com/availability",
    external: true,
  },
];

export default function AdminHome() {
  return (
    <>
      <h1 className="mb-1 text-[28px]">Admin</h1>
      <p className="mb-6 text-[15px] text-muted">
        Manage clients, lessons, and the day-to-day of Phonics to Physics.
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => {
          const inner = (
            <>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[14px] bg-cream text-xl">
                {s.icon}
              </div>
              <h2 className="mb-1 text-[18px]">{s.title}</h2>
              <p className="text-[14px] text-muted">{s.desc}</p>
            </>
          );
          const cls =
            "card block transition-shadow hover:shadow-[0_14px_34px_rgba(31,45,74,.12)]";
          if (s.external) {
            return (
              <a
                key={s.title}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cls}
              >
                {inner}
              </a>
            );
          }
          return (
            <Link key={s.title} href={s.href!} className={cls}>
              {inner}
            </Link>
          );
        })}
      </div>
    </>
  );
}
