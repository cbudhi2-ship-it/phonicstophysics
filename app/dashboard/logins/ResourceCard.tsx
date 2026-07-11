"use client";

import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setOk(true);
          setTimeout(() => setOk(false), 1200);
        });
      }}
      className="rounded-md border border-line bg-white px-2 py-1 text-[12px] font-semibold text-teal hover:bg-cream"
    >
      {ok ? "Copied ✓" : "Copy"}
    </button>
  );
}

export function ResourceCard({
  label,
  url,
  username,
  password,
  note,
}: {
  label: string;
  url: string | null;
  username: string | null;
  password: string | null;
  note: string | null;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[18px]">{label}</h3>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-teal !py-2 text-[13px]"
          >
            Open ↗
          </a>
        )}
      </div>

      <div className="mt-3 space-y-2 text-[14px]">
        {username && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-20 text-muted">Username</span>
            <span className="font-mono text-navy">{username}</span>
            <CopyButton text={username} />
          </div>
        )}
        {password && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-20 text-muted">Password</span>
            <span className="font-mono text-navy">
              {show ? password : "••••••••"}
            </span>
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="rounded-md border border-line bg-white px-2 py-1 text-[12px] font-semibold text-navy-soft hover:bg-cream"
            >
              {show ? "Hide" : "Show"}
            </button>
            <CopyButton text={password} />
          </div>
        )}
        {note && <p className="text-[13px] text-muted">{note}</p>}
      </div>
    </div>
  );
}
