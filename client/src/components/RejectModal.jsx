import { useState } from "react";
import { rejectComplaint } from "../services/api";

export default function RejectModal({ complaintId, isOpen, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for declining this ticket.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await rejectComplaint(complaintId, reason.trim());
      if (res.success) {
        onSuccess(res.complaint);
        onClose();
      } else {
        setError(res.message || "Failed to decline ticket.");
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
          <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">
            Decline Complaint
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

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Declining this ticket will return it to the Pending pool so administrators can reassign it to another technician.
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Reason for Declining <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Beyond my specialization, currently scheduled on another critical repair..."
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
              className="rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-700/25 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 cursor-pointer transition active:scale-95"
            >
              {submitting ? "Declining..." : "Confirm Decline"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
