import { useState } from "react";
import { submitFeedback } from "../services/api";

export default function FeedbackModal({ complaintId, isOpen, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await submitFeedback(complaintId, { rating, comment });
      if (res.success) {
        onSuccess(res.feedback);
        onClose();
      } else {
        setError(res.message || "Failed to submit feedback.");
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
            Rate Your Service
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Overall Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoveredRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="text-2xl transition transform hover:scale-125 cursor-pointer text-amber-400 drop-shadow-xs"
                    aria-label={`${star} star`}
                  >
                    {filled ? "★" : "☆"}
                  </button>
                );
              })}
              <span className="ml-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Feedback & Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="How was the technician's service? Was the issue fully resolved?"
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
              {submitting ? "Submitting..." : "Submit Rating"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
