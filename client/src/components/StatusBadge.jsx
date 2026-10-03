import React from "react";

const statusStyles = {
  Pending:
    "bg-amber-500/15 text-amber-800 border-amber-500/30 dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
  Assigned:
    "bg-sky-500/15 text-sky-800 border-sky-500/30 dark:bg-sky-400/15 dark:text-sky-300 dark:border-sky-400/30 shadow-[0_0_10px_rgba(14,165,233,0.1)]",
  "In Progress":
    "bg-emerald-500/15 text-emerald-800 border-emerald-500/30 dark:bg-emerald-400/15 dark:text-emerald-300 dark:border-emerald-400/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
  Resolved:
    "bg-teal-500/15 text-teal-800 border-teal-500/30 dark:bg-teal-400/15 dark:text-teal-300 dark:border-teal-400/30 shadow-[0_0_10px_rgba(20,184,166,0.1)]",
  Closed:
    "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:bg-slate-400/15 dark:text-slate-300 dark:border-slate-400/30",
  Failed:
    "bg-rose-500/15 text-rose-800 border-rose-500/30 dark:bg-rose-400/15 dark:text-rose-300 dark:border-rose-400/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]",
  Cancelled:
    "bg-gray-500/15 text-gray-700 border-gray-500/30 dark:bg-gray-400/15 dark:text-gray-300 dark:border-gray-400/30",
};

const dotColors = {
  Pending: "bg-amber-500 dark:bg-amber-400",
  Assigned: "bg-sky-500 dark:bg-sky-400",
  "In Progress": "bg-emerald-500 dark:bg-emerald-400",
  Resolved: "bg-teal-500 dark:teal-400",
  Closed: "bg-slate-400 dark:bg-slate-400",
  Failed: "bg-rose-500 dark:bg-rose-400",
  Cancelled: "bg-gray-400 dark:bg-gray-400",
};

export default function StatusBadge({ status, className = "" }) {
  const currentStatus = status || "Pending";
  const style =
    statusStyles[currentStatus] ||
    "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:bg-slate-400/15 dark:text-slate-300 dark:border-slate-400/30";
  const dotColor = dotColors[currentStatus] || "bg-slate-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md transition-all ${style} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-40 ${dotColor}`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`}
        />
      </span>
      {currentStatus}
    </span>
  );
}
