import { EmptyState } from "@/components/portal/EmptyState";

export default function HomeworkTab() {
  return (
    <EmptyState icon="📝" title="No homework set">
      Tasks Chris assigns between lessons will show up here, with due dates and a
      tick-off when they&apos;re done.
    </EmptyState>
  );
}
