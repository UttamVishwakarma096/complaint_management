import { useState } from "react";
import { resolveComplaint } from "../services/api";

export default function ResolutionModal({ complaintId, isOpen, onClose, onSuccess }) {
  const [summary, setSummary] = useState("");
  const [partsReplaced, setPartsReplaced] = useState("");
  const [timeSpentHours, setTimeSpentHours] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!summary.trim()) {
      setError("Resolution summary is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await resolveComplaint(complaintId, {
        summary: summary.trim(),
        partsReplaced: partsReplaced.trim(),
        timeSpentHours: timeSpentHours ? Number(timeSpentHours) : undefined,
      });

      if (res.success) {
        onSuccess(res.complaint);
        onClose();
      } else {
        setError(res.message || "Failed to mark as resolved.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl glass-panel p-6 sm:p-7 shadow-2xl text-slate-800 dark:text-slate-100 border border-white/60 dark:border-white/10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300">
            Complete & Resolve Ticket
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Resolution Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder="Explain how the issue was fixed..."
              className="w-full rounded-2xl glass-input p-3 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Parts / Materials Replaced (Optional)
            </label>
            <input
              type="text"
              value={partsReplaced}
              onChange={(e) => setPartsReplaced(e.target.value)}
              placeholder="e.g. Capacitor, 15A Circuit Breaker, PVC Valve"
              className="w-full rounded-2xl glass-input p-3 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Time Spent (Hours, Optional)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={timeSpentHours}
              onChange={(e) => setTimeSpentHours(e.target.value)}
              placeholder="e.g. 1.5"
              className="w-full rounded-2xl glass-input p-3 text-xs focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 dark:border-white/15 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-700/25 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 cursor-pointer transition active:scale-95"
            >
              {submitting ? "Resolving..." : "Confirm Resolution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
