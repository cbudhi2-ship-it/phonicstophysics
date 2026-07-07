export function EmptyState({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-2xl">
        {icon}
      </div>
      <h2 className="text-[20px]">{title}</h2>
      {children && (
        <p className="mt-2 max-w-[420px] text-[14px] text-muted">{children}</p>
      )}
    </div>
  );
}
