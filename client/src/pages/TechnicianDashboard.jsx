import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GlassBackground from "../components/GlassBackground";
import NotificationPopover from "../components/NotificationPopover";
import RejectModal from "../components/RejectModal";
import ResolutionModal from "../components/ResolutionModal";
import StatusBadge from "../components/StatusBadge";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import {
  acceptComplaint,
  getTechnicianComplaints,
  getTechnicianProfile,
  updateTechnicianAvailability,
} from "../services/api";

export default function TechnicianDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [availability, setAvailability] = useState("active");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Modals state
  const [rejectId, setRejectId] = useState(null);
  const [resolveId, setResolveId] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const notifRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [compRes, profRes] = await Promise.all([
        getTechnicianComplaints(),
        getTechnicianProfile(),
      ]);

      if (compRes.complaints) {
        setComplaints(compRes.complaints);
      }
      if (profRes.profile) {
        setProfile(profRes.profile);
        setAvailability(profRes.profile.status || "active");
      }
    } catch (err) {
      console.error("Failed to load technician data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAvailability = async () => {
    const nextStatus = availability === "active" ? "inactive" : "active";
    setUpdatingStatus(true);
    try {
      const res = await updateTechnicianAvailability(nextStatus);
      if (res.success) {
        setAvailability(nextStatus);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      const res = await acceptComplaint(id);
      if (res.success) {
        setComplaints((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: "In Progress" } : c))
        );
      }
    } catch (err) {
      alert(err.message || "Failed to accept complaint.");
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filter === "all") return true;
    if (filter === "assigned") return c.status === "Assigned";
    if (filter === "in_progress") return c.status === "In Progress";
    if (filter === "resolved") return ["Resolved", "Closed"].includes(c.status);
    return true;
  });

  const totalAssigned = complaints.filter((c) => c.status === "Assigned").length;
  const totalInProgress = complaints.filter((c) => c.status === "In Progress").length;
  const totalResolved = complaints.filter((c) => ["Resolved", "Closed"].includes(c.status)).length;

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <GlassBackground />

      {/* Top Glass Navigation */}
      <header className="sticky top-0 z-40 glass-header">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Link to="/technician" className="flex items-center gap-2.5 group">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30">
                F
              </span>
              <div>
                <span className="font-extrabold text-base bg-gradient-to-r from-emerald-800 to-teal-700 dark:from-emerald-300 dark:to-teal-200 bg-clip-text text-transparent">
                  FixCare
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Technician Portal
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />

            {/* Availability Toggle */}
            <button
              type="button"
              disabled={updatingStatus}
              onClick={handleToggleAvailability}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer backdrop-blur-md ${
                availability === "active"
                  ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 shadow-xs"
                  : "border-slate-300 dark:border-white/10 bg-slate-200/50 dark:bg-white/5 text-slate-600 dark:text-slate-400"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  availability === "active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              <span className="hidden sm:inline">
                {availability === "active" ? "Available on Duty" : "Off Duty / Inactive"}
              </span>
              <span className="sm:hidden">
                {availability === "active" ? "Active" : "Off Duty"}
              </span>
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className="relative grid h-10 w-10 place-items-center rounded-xl glass-card text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer"
                aria-label="Notifications"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
              </button>
              <NotificationPopover isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-xl glass-card py-1.5 pl-1.5 pr-3 hover:bg-white/80 dark:hover:bg-white/10 cursor-pointer transition"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-xs font-bold text-white shadow-xs">
                  {user?.name?.[0]?.toUpperCase() || "T"}
                </span>
                <span className="hidden sm:inline font-bold text-xs text-slate-800 dark:text-slate-200">
                  {user?.name}
                </span>
                <span className="text-xs text-slate-400">⌄</span>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl glass-dropdown p-4 shadow-2xl text-xs z-50 border border-white/60 dark:border-white/10 animate-in fade-in zoom-in-95 duration-150">
                  <div className="pb-3 border-b border-black/5 dark:border-white/10">
                    <p className="font-bold text-slate-900 dark:text-white">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    <span className="mt-1.5 inline-block rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      Technician
                    </span>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      to="/profile"
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-slate-400">👤</span>
                        <span>Account Profile</span>
                      </span>
                      <span className="text-slate-400">→</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate("/login");
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-rose-500">🚪</span>
                        <span>Sign Out</span>
                      </span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass-card px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2 border border-emerald-500/20">
              <span>⚒</span> Active Work Queue
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Assigned Tasks
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Review, accept, and resolve complaints assigned to you.
            </p>
          </div>
          {profile?.specialization && (
            <div className="rounded-2xl glass-card px-4 py-2.5 text-xs border border-white/60 dark:border-white/10 flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">Specialization:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">{profile.specialization}</span>
              {profile.experience && (
                <span className="rounded-lg bg-emerald-500/15 dark:bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  {profile.experience} yrs exp
                </span>
              )}
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl glass-card glass-card-hover p-5 border border-white/60 dark:border-white/10">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Action</p>
            <p className="mt-2 text-3xl font-black text-amber-600 dark:text-amber-400">{totalAssigned}</p>
          </div>
          <div className="rounded-2xl glass-card glass-card-hover p-5 border border-white/60 dark:border-white/10">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">In Progress</p>
            <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">{totalInProgress}</p>
          </div>
          <div className="rounded-2xl glass-card glass-card-hover p-5 border border-white/60 dark:border-white/10">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resolved</p>
            <p className="mt-2 text-3xl font-black text-teal-600 dark:text-teal-400">{totalResolved}</p>
          </div>
          <div className="rounded-2xl glass-card glass-card-hover p-5 border border-white/60 dark:border-white/10">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Lifetime</p>
            <p className="mt-2 text-3xl font-black text-slate-800 dark:text-slate-200">{complaints.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap gap-2 pb-3">
          {[
            { id: "all", label: `All Tasks (${complaints.length})` },
            { id: "assigned", label: `Assigned (${totalAssigned})` },
            { id: "in_progress", label: `In Progress (${totalInProgress})` },
            { id: "resolved", label: `Resolved (${totalResolved})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/25"
                  : "glass-card text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Complaints List */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-3xl glass-card animate-pulse" />
              ))}
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="rounded-3xl glass-panel p-12 text-center border border-dashed border-slate-300 dark:border-white/10">
              <span className="text-3xl">☕</span>
              <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">No complaints in this queue</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">All clear! Check back later for new dispatches.</p>
            </div>
          ) : (
            filteredComplaints.map((c) => (
              <div
                key={c._id}
                className="rounded-3xl glass-card p-6 shadow-xl border border-white/60 dark:border-white/10 transition hover:scale-[1.005]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <StatusBadge status={c.status} />
                      <span className="rounded-lg bg-black/5 dark:bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {c.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Priority: <strong className="text-slate-800 dark:text-slate-200">{c.priority}</strong>
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                      {c.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2">
                      {c.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:self-center">
                    {c.status === "Assigned" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAccept(c._id)}
                          className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-700/25 hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer active:scale-95"
                        >
                          Accept Ticket
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectId(c._id)}
                          className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer active:scale-95"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {c.status === "In Progress" && (
                      <button
                        type="button"
                        onClick={() => setResolveId(c._id)}
                        className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-700/25 hover:from-teal-500 hover:to-emerald-500 transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                      >
                        <span>✓</span> Mark Resolved
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate(`/technician/complaints/${c._id}`)}
                      className="rounded-xl border border-slate-300 dark:border-white/15 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                    >
                      Details & Timeline →
                    </button>
                  </div>
                </div>

                {/* Resolution Details Card if resolved */}
                {c.resolutionDetails?.summary && (
                  <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-900 dark:text-emerald-300">
                    <p className="font-bold text-emerald-800 dark:text-emerald-200">Resolution Summary:</p>
                    <p className="mt-1 leading-relaxed">{c.resolutionDetails.summary}</p>
                    {c.resolutionDetails.partsReplaced && (
                      <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400">
                        Parts replaced: {c.resolutionDetails.partsReplaced}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modals */}
      <RejectModal
        complaintId={rejectId}
        isOpen={Boolean(rejectId)}
        onClose={() => setRejectId(null)}
        onSuccess={() => {
          setComplaints((prev) => prev.filter((c) => c._id !== rejectId));
        }}
      />

      <ResolutionModal
        complaintId={resolveId}
        isOpen={Boolean(resolveId)}
        onClose={() => setResolveId(null)}
        onSuccess={(updated) => {
          setComplaints((prev) =>
            prev.map((c) => (c._id === updated._id ? updated : c))
          );
        }}
      />
    </div>
  );
}
