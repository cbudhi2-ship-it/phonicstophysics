export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-14">
      <div className="wrap max-w-[760px]">
        <h1 className="text-[36px]">{title}</h1>
        <p className="mt-2 text-[14px] text-muted">Last updated: {updated}</p>
        <div
          className="mt-8 space-y-4 text-[16px] text-navy-soft
            [&_a]:font-semibold [&_a]:text-teal
            [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-[22px] [&_h2]:text-navy
            [&_li]:ml-1 [&_p]:leading-relaxed
            [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
