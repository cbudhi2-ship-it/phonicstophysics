"use client";

import { useState, useTransition } from "react";
import { toggleHomeworkDone } from "@/lib/dashboard-actions";

export function HomeworkItem({
  id,
  title,
  detail,
  dueDate,
  attachmentUrl,
  done: initialDone,
}: {
  id: string;
  title: string;
  detail: string | null;
  dueDate: string | null;
  attachmentUrl: string | null;
  done: boolean;
}) {
  const [done, setDone] = useState(initialDone);
  const [pending, start] = useTransition();

  const due = dueDate
    ? new Date(dueDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        done ? "border-line bg-cream" : "border-line bg-white"
      }`}
    >
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={done}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.checked;
            setDone(next);
            start(async () => {
              await toggleHomeworkDone(id, next);
            });
          }}
          className="mt-1 h-5 w-5 accent-teal"
        />
        <div className="flex-1">
          <div
            className={`font-semibold ${done ? "text-muted line-through" : "text-navy"}`}
          >
            {title}
            {due && (
              <span className="ml-2 text-[12px] font-normal text-coral-dark">
                due {due}
              </span>
            )}
          </div>
          {detail && <p className="mt-1 text-[14px] text-muted">{detail}</p>}
          {attachmentUrl && (
            <a
              href={attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-[13px] font-semibold text-teal hover:underline"
            >
              Open attachment ↗
            </a>
          )}
        </div>
      </label>
    </div>
  );
}
