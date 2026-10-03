import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import FeedbackModal from "../components/FeedbackModal";
import GlassBackground from "../components/GlassBackground";
import RejectModal from "../components/RejectModal";
import ResolutionModal from "../components/ResolutionModal";
import StatusBadge from "../components/StatusBadge";
import ThemeToggle from "../components/ThemeToggle";
import TimelineComments from "../components/TimelineComments";
import { useAuth } from "../context/AuthContext";
import {
  acceptComplaint,
  cancelComplaint,
  getComplaintById,
  reopenComplaint,
} from "../services/api";

const formatDate = (date) => {
  if (!date) return "Date unavailable";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

const progressSteps = [
  { label: "Complaint Created", complete: () => true },
  {
    label: "Assigned to Technician",
    complete: (status) =>
      ["Assigned", "In Progress", "Resolved", "Closed"].includes(status),
  },
  {
    label: "Technician Working",
    complete: (status) =>
      ["In Progress", "Resolved", "Closed"].includes(status),
  },
  {
    label: "Resolved & Closed",
    complete: (status) => ["Resolved", "Closed"].includes(status),
  },
];

function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const res = await getComplaintById(id);
      if (res.complaint) {
        setComplaint(res.complaint);
      } else {
        setError(res.message || "Complaint could not be found.");
      }
    } catch (err) {
      setError(err.message || "Failed to load complaint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const goBack = () => {
    if (user?.role === "technician") {
      navigate("/technician");
    } else if (user?.role === "admin") {
      navigate("/admin/complaints");
    } else {
      navigate("/dashboard", {
        state: { activeView: location.state?.fromView || "complaints" },
      });
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt("Reason for cancelling this complaint:");
    if (!reason) return;

    setActionLoading(true);
    try {
      const res = await cancelComplaint(id, reason);
      if (res.success) {
        setComplaint(res.complaint);
      } else {
        alert(res.message || "Failed to cancel complaint.");
      }
    } catch (err) {
      alert(err.message || "Error cancelling complaint.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async () => {
    const reason = window.prompt("Why is this complaint being reopened?");
    if (!reason) return;

    setActionLoading(true);
    try {
      const res = await reopenComplaint(id, reason);
      if (res.success) {
        setComplaint(res.complaint);
      } else {
        alert(res.message || "Failed to reopen complaint.");
      }
    } catch (err) {
      alert(err.message || "Error reopening complaint.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      const res = await acceptComplaint(id);
      if (res.success) {
        setComplaint((prev) => ({ ...prev, status: "In Progress" }));
      } else {
        alert(res.message || "Failed to accept.");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const status = complaint?.status || "Pending";
  const isCustomer = user?.role === "customer";
  const isTechnician = user?.role === "technician";

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <GlassBackground />

      {/* Top Glass Navigation Bar */}
      <header className="sticky top-0 z-30 glass-header">
        <div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30">
              F
            </span>
            <span className="font-extrabold text-base bg-gradient-to-r from-emerald-800 to-teal-700 dark:from-emerald-300 dark:to-teal-200 bg-clip-text text-transparent">
              FixCare
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 rounded-xl glass-card px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition cursor-pointer"
            >
              <span>←</span> Back to Workspace
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
        {loading ? (
          <div className="animate-pulse space-y-6" aria-label="Loading complaint">
            <div className="h-10 w-2/3 rounded-2xl glass-card" />
            <div className="h-56 rounded-3xl glass-card" />
            <div className="h-64 rounded-3xl glass-card" />
          </div>
        ) : error ? (
          <section className="rounded-3xl glass-panel p-10 text-center border border-white/60 dark:border-white/10 shadow-xl">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Complaint Unavailable</h1>
            <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
            <button
              type="button"
              onClick={goBack}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md cursor-pointer"
            >
              Return Back
            </button>
          </section>
        ) : complaint ? (
          <div className="space-y-8">
            {/* Header info & Action buttons */}
            <div className="rounded-3xl glass-card p-6 sm:p-8 shadow-xl border border-white/60 dark:border-white/10">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={status} />
                    <span className="text-xs font-mono text-slate-400">
                      #{String(complaint._id).slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {complaint.title}
                  </h1>
                </div>

                {/* Role-Specific Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Customer Actions */}
                  {isCustomer && ["Pending", "Assigned"].includes(status) && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleCancel}
                      className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer active:scale-95"
                    >
                      Cancel Complaint
                    </button>
                  )}

                  {isCustomer && ["Resolved", "Closed"].includes(status) && (
                    <>
                      {!complaint.feedback?.rating && (
                        <button
                          type="button"
                          onClick={() => setFeedbackOpen(true)}
                          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-amber-400 hover:to-orange-400 transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                        >
                          <span>★</span> Rate Service
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleReopen}
                        className="rounded-xl border border-slate-300 dark:border-white/15 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                      >
                        Reopen Ticket
                      </button>
                    </>
                  )}

                  {/* Technician Actions */}
                  {isTechnician && status === "Assigned" && (
                    <>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleAccept}
                        className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-700/25 hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer active:scale-95"
                      >
                        Accept Task
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectOpen(true)}
                        className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer active:scale-95"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {isTechnician && status === "In Progress" && (
                    <button
                      type="button"
                      onClick={() => setResolveOpen(true)}
                      className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-700/25 hover:from-teal-500 hover:to-emerald-500 transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      <span>✓</span> Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 py-6 border-b border-black/5 dark:border-white/10 text-xs">
                <div className="rounded-2xl glass-panel p-3.5">
                  <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Category</p>
                  <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">{complaint.category}</p>
                </div>
                <div className="rounded-2xl glass-panel p-3.5">
                  <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Priority</p>
                  <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">{complaint.priority}</p>
                </div>
                <div className="rounded-2xl glass-panel p-3.5">
                  <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Created Date</p>
                  <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">{formatDate(complaint.createdAt)}</p>
                </div>
                <div className="rounded-2xl glass-panel p-3.5">
                  <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Assigned Specialist</p>
                  <p className="mt-1 font-bold text-slate-800 dark:text-slate-100 truncate">
                    {complaint.assignedTo?.name || "Pending Dispatch"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="pt-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Issue Description
                </h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              {/* Cancellation Reason if cancelled */}
              {complaint.cancellationReason && (
                <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-800 dark:text-rose-300">
                  <p className="font-bold">Cancellation Reason:</p>
                  <p className="mt-1 leading-relaxed">{complaint.cancellationReason}</p>
                </div>
              )}

              {/* Reopen Reason if reopened */}
              {complaint.reopenReason && (
                <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300">
                  <p className="font-bold">Reopen Reason:</p>
                  <p className="mt-1 leading-relaxed">{complaint.reopenReason}</p>
                </div>
              )}

              {/* Resolution Details */}
              {complaint.resolutionDetails?.summary && (
                <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-xs text-emerald-950 dark:text-emerald-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
                      ✓
                    </span>
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">Resolution Report</h3>
                  </div>
                  <p className="mt-1 leading-relaxed">{complaint.resolutionDetails.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-emerald-800 dark:text-emerald-400 font-semibold border-t border-emerald-500/20 pt-2">
                    {complaint.resolutionDetails.partsReplaced && (
                      <span>Parts replaced: {complaint.resolutionDetails.partsReplaced}</span>
                    )}
                    {complaint.resolutionDetails.timeSpentHours && (
                      <span>Time taken: {complaint.resolutionDetails.timeSpentHours} hrs</span>
                    )}
                  </div>
                </div>
              )}

              {/* Feedback Submitted Section */}
              {complaint.feedback?.rating && (
                <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-xs text-amber-950 dark:text-amber-300">
                  <div className="flex items-center gap-2">
                    <span className="text-base text-amber-400 drop-shadow-xs">
                      {"★".repeat(complaint.feedback.rating)}
                      {"☆".repeat(5 - complaint.feedback.rating)}
                    </span>
                    <span className="font-bold">Verified Customer Review ({complaint.feedback.rating}/5)</span>
                  </div>
                  {complaint.feedback.comment && (
                    <p className="mt-2 italic text-slate-700 dark:text-slate-300 leading-relaxed">
                      "{complaint.feedback.comment}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Progress Tracker (unless cancelled) */}
            {status !== "Cancelled" && (
              <div className="rounded-3xl glass-card p-6 sm:p-8 shadow-xl border border-white/60 dark:border-white/10">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Progress Timeline</h2>
                <ol className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {progressSteps.map((step, index) => {
                    const complete = step.complete(status);
                    return (
                      <li key={step.label} className="relative flex sm:flex-col items-center sm:items-start gap-3 rounded-2xl glass-panel p-3.5 border border-white/40 dark:border-white/5">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            complete
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                              : "border border-slate-300 dark:border-white/20 text-slate-400"
                          }`}
                        >
                          {complete ? "✓" : index + 1}
                        </span>
                        <span
                          className={`text-xs ${
                            complete ? "font-bold text-slate-900 dark:text-white" : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {/* Real-time Conversation & Comments Log */}
            <TimelineComments complaintId={id} userRole={user?.role} />
          </div>
        ) : null}
      </main>

      {/* Modals */}
      <FeedbackModal
        complaintId={id}
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSuccess={(feedback) => {
          setComplaint((prev) => ({ ...prev, feedback }));
        }}
      />

      <ResolutionModal
        complaintId={id}
        isOpen={resolveOpen}
        onClose={() => setResolveOpen(false)}
        onSuccess={(updated) => {
          setComplaint(updated);
        }}
      />

      <RejectModal
        complaintId={id}
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSuccess={(updated) => {
          setComplaint(updated);
        }}
      />
    </div>
  );
}

export default ComplaintDetail;
