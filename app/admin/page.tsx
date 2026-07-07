const sections = [
  {
    icon: "👥",
    title: "Clients & children",
    desc: "Enable accounts after an intro call, manage children and their tiers.",
    soon: true,
  },
  {
    icon: "✉️",
    title: "Enquiries",
    desc: "New enquiries from the contact form, with status tracking.",
    soon: true,
  },
  {
    icon: "🎟️",
    title: "Lessons & tokens",
    desc: "See each client's balance and transaction history; make adjustments.",
    soon: true,
  },
  {
    icon: "🎯",
    title: "Targets & homework",
    desc: "Set learning goals and assign homework per child.",
    soon: true,
  },
  {
    icon: "💬",
    title: "Messages",
    desc: "Reply to parent messages from one inbox.",
    soon: true,
  },
  {
    icon: "📅",
    title: "Availability",
    desc: "Manage your bookable hours (opens Cal.com).",
    soon: true,
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
        {sections.map((s) => (
          <div key={s.title} className="card">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[14px] bg-cream text-xl">
              {s.icon}
            </div>
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-[18px]">{s.title}</h2>
              {s.soon && (
                <span className="rounded-pill bg-line/60 px-2 py-0.5 text-[11px] font-bold text-muted">
                  Soon
                </span>
              )}
            </div>
            <p className="text-[14px] text-muted">{s.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}
