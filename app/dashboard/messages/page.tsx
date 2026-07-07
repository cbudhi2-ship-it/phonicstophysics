import { EmptyState } from "@/components/portal/EmptyState";

export default function MessagesTab() {
  return (
    <EmptyState icon="💬" title="No messages yet">
      Message Chris directly here — ask a question or share an update. It&apos;s
      private between you and Chris, and you&apos;ll get an email when he
      replies.
    </EmptyState>
  );
}
