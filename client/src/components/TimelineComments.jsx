import { useEffect, useState } from "react";
import { addComment, getTimeline } from "../services/api";

export default function TimelineComments({ complaintId, userRole }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadTimeline = async () => {
    try {
      const res = await getTimeline(complaintId);
      if (res.success) {
        setComments(res.comments || []);
      }
    } catch (err) {
      console.error("Failed to load timeline:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintId) {
      loadTimeline();
    }
  }, [complaintId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await addComment(complaintId, {
        message: message.trim(),
        isInternal: Boolean(isInternal),
      });

      if (res.success) {
        setMessage("");
        setIsInternal(false);
        setComments((prev) => [...prev, res.comment]);
      } else {
        setError(res.message || "Failed to post message.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const isStaff = userRole === "admin" || userRole === "technician";

  return (
    <div className="rounded-3xl glass-card p-6 sm:p-7 shadow-xl border border-white/60 dark:border-white/10 text-slate-800 dark:text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Activity & Conversation
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Direct communication log between customer, technician, and support.
          </p>
        </div>
      </div>

      {/* Comment List */}
      <div className="mt-6 space-y-3.5 max-h-96 overflow-y-auto pr-1">
        {loading ? (
          <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">Loading timeline...</p>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-white/20 dark:bg-black/20">
            💬 No messages yet. Start the conversation below.
          </div>
        ) : (
          comments.map((item) => {
            const author = item.author || {};
            const role = author.role || "user";
            const roleBadgeStyle =
              role === "admin"
                ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30"
                : role === "technician"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                : "bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30";

            return (
              <div
                key={item._id}
                className={`rounded-2xl p-4 text-xs transition-all backdrop-blur-md ${
                  item.isInternal
                    ? "border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.06)]"
                    : "border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {author.name || "Unknown"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${roleBadgeStyle}`}
                    >
                      {role}
                    </span>
                    {item.isInternal && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 border border-amber-500/30">
                        🔒 Internal Note
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                  {item.message}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-6 border-t border-black/5 dark:border-white/10 pt-4">
        {error && (
          <p className="mb-2 text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
        )}
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Type your message, update, or note here..."
            className="w-full rounded-2xl glass-input p-3 text-xs focus:outline-none"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          {isStaff ? (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Internal note (hidden from customer)
            </label>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-700/25 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition cursor-pointer active:scale-95"
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </div>
  );
}
