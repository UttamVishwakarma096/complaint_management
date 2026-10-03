import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GlassBackground from "../components/GlassBackground";
import GlassSelect from "../components/GlassSelect";
import NotificationPopover from "../components/NotificationPopover";
import StatusBadge from "../components/StatusBadge";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { createComplaint, getComplaints } from "../services/api";

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: "⌂" },
  { id: "new", label: "New complaint", icon: "+" },
  { id: "complaints", label: "My complaints", icon: "▤" },
  { id: "history", label: "History", icon: "◷" },
];

const fetchComplaints = async () => {
  const response = await getComplaints();
  if (!Array.isArray(response.complaints)) {
    throw new Error(response.message || "We couldn't load your complaints.");
  }
  return response.complaints;
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeView, setActiveView] = useState(
    () => location.state?.activeView || "dashboard",
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "",
    priority: "Medium",
    description: "",
  });
  const headerActionsRef = useRef(null);

  const loadComplaints = async () => {
    setLoading(true);
    setLoadError("");
    try {
      setComplaints(await fetchComplaints());
    } catch (error) {
      setLoadError(error.message || "We couldn't load your complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints()
      .then(setComplaints)
      .catch((error) => {
        setLoadError(error.message || "We couldn't load your complaints.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const closePopovers = (event) => {
      if (!headerActionsRef.current?.contains(event.target)) {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener("pointerdown", closePopovers);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closePopovers);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const openCreateForm = () => {
    setFormError("");
    setIsCreateOpen(true);
  };

  const closeCreateForm = () => {
    setIsCreateOpen(false);
    setFormError("");
    setForm({
      title: "",
      category: "",
      priority: "Medium",
      description: "",
    });
  };

  const handleNavigation = (id) => {
    if (id === "new") {
      openCreateForm();
      return;
    }
    setActiveView(id);
  };

  const handleCreateComplaint = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.title.trim() || !form.category.trim() || !form.description.trim()) {
      setFormError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await createComplaint(form);
      const createdComplaint = response.complaint || response;
      setComplaints((current) => [createdComplaint, ...current]);
      closeCreateForm();
      setActiveView("complaints");
    } catch (error) {
      setFormError(error.message || "Failed to submit your complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sortedComplaints = [...complaints].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );

  const pendingCount = complaints.filter(
    (item) => (item.status || "Pending") === "Pending",
  ).length;

  const resolvedCount = complaints.filter((item) =>
    ["Resolved", "Closed"].includes(item.status),
  ).length;

  const inProgressCount = complaints.filter(
    (item) => item.status === "In Progress" || item.status === "Assigned",
  ).length;

  const filteredComplaints = sortedComplaints.filter((item) => {
    if (activeView === "history") {
      return ["Resolved", "Closed", "Failed"].includes(item.status);
    }
    return true;
  });

  const visibleComplaints =
    activeView === "dashboard"
      ? sortedComplaints.slice(0, 5)
      : filteredComplaints;

  const sectionTitle = {
    dashboard: "Recent requests",
    complaints: "All registered complaints",
    history: "Resolution history",
  }[activeView];

  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  const initials = (user?.name || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <GlassBackground />

      {/* Glass Sidebar */}
      <aside className="border-b lg:border-b-0 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col glass-sidebar">
        <div className="flex h-18 items-center justify-between px-6 border-b border-black/5 dark:border-white/10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30">
              F
            </span>
            <span className="font-extrabold text-lg bg-gradient-to-r from-emerald-800 to-teal-700 dark:from-emerald-300 dark:to-teal-200 bg-clip-text text-transparent">
              FixCare
            </span>
          </Link>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>

        <nav
          aria-label="Workspace navigation"
          className="flex gap-1 overflow-x-auto px-4 py-3 sm:px-6 lg:flex-1 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-4 lg:py-6"
        >
          {navigation.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigation(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-all lg:w-full cursor-pointer ${
                  isActive
                    ? "bg-emerald-600/15 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/30 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span
                  className="grid h-5 w-5 place-items-center text-lg leading-none"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-black/5 dark:border-white/10 p-4 lg:mt-auto">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5 text-left text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer flex items-center justify-between"
          >
            <span>Log out</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* Glass Top Header */}
        <header className="sticky top-0 z-20 flex h-18 items-center justify-between px-6 sm:px-8 lg:px-10 glass-header">
          <div className="flex items-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
              Customer Workspace
            </p>
          </div>

          <div
            ref={headerActionsRef}
            className="relative flex items-center gap-3 sm:gap-4"
          >
            <ThemeToggle />

            {/* Notification Bell Button */}
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              onClick={() => {
                setNotificationsOpen((open) => !open);
                setProfileOpen(false);
              }}
              className="relative grid h-10 w-10 place-items-center rounded-xl glass-card text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer"
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
              {unreadNotifCount > 0 && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            <NotificationPopover
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
              onUnreadCountChange={setUnreadNotifCount}
            />

            {/* User Profile Pill */}
            <button
              type="button"
              aria-expanded={profileOpen}
              onClick={() => {
                setProfileOpen((open) => !open);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2.5 rounded-xl glass-card py-1.5 pl-1.5 pr-3 hover:bg-white/80 dark:hover:bg-white/10 cursor-pointer transition"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-xs font-bold text-white shadow-xs">
                {initials}
              </span>
              <span className="hidden max-w-36 truncate text-xs font-bold sm:block text-slate-800 dark:text-slate-200">
                {user?.name || "Account"}
              </span>
              <span className="text-xs text-slate-400" aria-hidden="true">
                ⌄
              </span>
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-13 z-30 w-64 rounded-2xl glass-dropdown p-4 shadow-2xl text-xs border border-white/60 dark:border-white/10 animate-in fade-in zoom-in-95 duration-150">
                <div className="pb-3 border-b border-black/5 dark:border-white/10">
                  <p className="truncate font-bold text-slate-900 dark:text-white">
                    {user?.name || "Account"}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {user?.email || "Email unavailable"}
                  </p>
                  <span className="mt-1.5 inline-block rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Customer
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between rounded-xl px-2.5 py-2 font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-slate-400">👤</span>
                      <span>Account & Security</span>
                    </span>
                    <span className="text-slate-400">→</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
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
        </header>

        {/* Dashboard Content */}
        <main className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10 lg:px-10">
          {/* Welcome Banner */}
          <section className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full glass-card px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2 border border-emerald-500/20">
                <span>✦</span> Overview & Active Reports
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome back, {firstName}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Monitor your appliance repairs and community service requests.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateForm}
              className="flex h-11 items-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 cursor-pointer"
            >
              <span className="text-lg leading-none" aria-hidden="true">
                +
              </span>
              Create new complaint
            </button>
          </section>

          {/* Metric Cards */}
          <section
            aria-label="Complaint summary"
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4"
          >
            {[
              {
                label: "Total filed",
                value: complaints.length,
                color: "text-emerald-700 dark:text-emerald-400",
                icon: "▤",
                bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
              },
              {
                label: "Pending assignment",
                value: pendingCount,
                color: "text-amber-700 dark:text-amber-400",
                icon: "◷",
                bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
              },
              {
                label: "In progress",
                value: inProgressCount,
                color: "text-sky-700 dark:text-sky-400",
                icon: "⚒",
                bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
              },
              {
                label: "Resolved",
                value: resolvedCount,
                color: "text-teal-700 dark:text-teal-400",
                icon: "✓",
                bg: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20",
              },
            ].map((stat) => (
              <article
                key={stat.label}
                className="flex items-center justify-between rounded-2xl glass-card glass-card-hover p-5 border border-white/60 dark:border-white/10"
              >
                <div>
                  <p className={`text-3xl font-black ${stat.color}`}>
                    {loading ? "–" : stat.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl text-xl font-bold ${stat.bg}`}
                  aria-hidden="true"
                >
                  {stat.icon}
                </span>
              </article>
            ))}
          </section>

          {/* Complaints Section */}
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {sectionTitle}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {activeView === "history"
                    ? "Resolved and closed requests"
                    : "Track progress and technician responses"}
                </p>
              </div>
              {activeView === "dashboard" && sortedComplaints.length > 5 && (
                <button
                  type="button"
                  onClick={() => setActiveView("complaints")}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  View all complaints →
                </button>
              )}
            </div>

            <div className="overflow-hidden rounded-3xl glass-panel border border-white/60 dark:border-white/10 shadow-xl">
              {loading ? (
                <div
                  className="space-y-4 p-6"
                  aria-label="Loading complaints"
                  aria-live="polite"
                >
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-16 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5"
                    />
                  ))}
                </div>
              ) : loadError ? (
                <div role="alert" className="px-6 py-12 text-center">
                  <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                    {loadError}
                  </p>
                  <button
                    type="button"
                    onClick={loadComplaints}
                    className="mt-3 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Try reloading complaints
                  </button>
                </div>
              ) : visibleComplaints.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <span className="text-3xl text-emerald-500">📋</span>
                  <p className="mt-3 font-bold text-slate-800 dark:text-slate-200">
                    {activeView === "history"
                      ? "No resolution history yet"
                      : "No complaints submitted yet"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    File a new ticket to get connected with a technician immediately.
                  </p>
                  <button
                    type="button"
                    onClick={openCreateForm}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-700/25 hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer"
                  >
                    <span>+</span> File your first ticket
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-black/5 dark:divide-white/5">
                  {visibleComplaints.map((complaint) => (
                    <li key={complaint._id}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/dashboard/complaints/${complaint._id}`, {
                            state: { fromView: activeView },
                          })
                        }
                        className="grid w-full gap-3 p-5 sm:px-7 text-left transition hover:bg-black/5 dark:hover:bg-white/5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center cursor-pointer group"
                      >
                        <div className="min-w-0">
                          <span className="block truncate font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition">
                            {complaint.title}
                          </span>
                          <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="rounded-lg bg-black/5 dark:bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              {complaint.category}
                            </span>
                            <span aria-hidden="true">•</span>
                            <StatusBadge status={complaint.status} />
                            <span aria-hidden="true">•</span>
                            <span className="text-[11px]">
                              Priority: <strong className="text-slate-700 dark:text-slate-300">{complaint.priority || "Medium"}</strong>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-slate-400">
                          <time dateTime={complaint.createdAt}>
                            {formatDate(complaint.createdAt)}
                          </time>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition flex items-center gap-1">
                            Details <span>→</span>
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Glassmorphic Modal for Creating Complaint */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCreateForm();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-title"
            className="my-auto w-full max-w-lg rounded-3xl glass-panel p-7 sm:p-9 shadow-2xl border border-white/60 dark:border-white/10 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  New Request
                </p>
                <h2 id="create-title" className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                  File a Complaint
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={closeCreateForm}
                className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleCreateComplaint}>
              <div>
                <label
                  htmlFor="complaint-title"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                >
                  Issue Summary
                </label>
                <input
                  id="complaint-title"
                  name="title"
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  required
                  maxLength={120}
                  className="h-11 w-full rounded-2xl glass-input px-3.5 text-sm outline-none"
                  placeholder="e.g. Living room AC not cooling"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20">
                <div>
                  <label
                    htmlFor="complaint-category"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                  >
                    Category
                  </label>
                  <GlassSelect
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    options={[
                      { value: "Electrical", label: "Electrical" },
                      { value: "Plumbing", label: "Plumbing" },
                      { value: "Network", label: "Network" },
                      { value: "Appliance", label: "Appliance" },
                      { value: "Other", label: "Other" },
                    ]}
                    placeholder="Select category"
                    ariaLabel="Category"
                  />
                </div>

                <div>
                  <label
                    htmlFor="complaint-priority"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                  >
                    Priority
                  </label>
                  <GlassSelect
                    value={form.priority}
                    onChange={(event) =>
                      setForm({ ...form, priority: event.target.value })
                    }
                    options={[
                      { value: "Low", label: "Low" },
                      { value: "Medium", label: "Medium" },
                      { value: "High", label: "High" },
                    ]}
                    placeholder="Select priority"
                    ariaLabel="Priority"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="complaint-description"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                >
                  Describe the Issue in Detail
                </label>
                <textarea
                  id="complaint-description"
                  name="description"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  required
                  maxLength={2000}
                  rows={4}
                  className="w-full resize-y rounded-2xl glass-input p-3 text-sm outline-none"
                  placeholder="Include error codes, unusual sounds, or any relevant context..."
                />
              </div>

              {formError && (
                <div role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={closeCreateForm}
                  className="rounded-xl border border-slate-300 dark:border-white/15 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-700/25 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 transition active:scale-95 cursor-pointer"
                >
                  {submitting ? "Submitting…" : "Submit Complaint"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
