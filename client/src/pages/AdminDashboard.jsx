import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GlassBackground from "../components/GlassBackground";
import GlassSelect from "../components/GlassSelect";
import NotificationPopover from "../components/NotificationPopover";
import StatusBadge from "../components/StatusBadge";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  assignTechnician,
  createTechnician,
  getAdminComplaints,
  getAdminCustomers,
  getAdminTechnicians,
  getNotifications,
} from "../services/api";

const navigation = [
  { path: "/admin", label: "Dashboard", icon: "⌂" },
  { path: "/admin/complaints", label: "Complaints", icon: "▤" },
  { path: "/admin/technicians", label: "Technicians", icon: "⚒" },
  { path: "/admin/customers", label: "Customers", icon: "♧" },
  { path: "/admin/technicians/new", label: "Add Technician", icon: "+" },
  { path: "/admin/analytics", label: "Analytics", icon: "▥" },
  { path: "/admin/settings", label: "Settings", icon: "⚙" },
];

const statusStyles = {
  Pending: true,
  Assigned: true,
  "In Progress": true,
  Resolved: true,
  Closed: true,
  Failed: true,
};
const statusList = Object.keys(statusStyles);

const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(date))
    : "—";

const displayName = (person) => person?.name || "Unassigned";
const complaintId = (complaint) =>
  String(complaint._id || "")
    .slice(-6)
    .toUpperCase() || "—";

function StatusPill({ status }) {
  return <StatusBadge status={status} />;
}

function Metric({ label, value, accent, icon }) {
  return (
    <article className="flex min-h-28 items-center justify-between rounded-2xl glass-card glass-card-hover p-5 border border-white/60 dark:border-white/10 shadow-xs">
      <div>
        <p
          className="text-3xl font-black leading-none"
          style={{ color: accent }}
        >
          {value}
        </p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      </div>
      <span
        aria-hidden="true"
        className="grid h-12 w-12 place-items-center rounded-2xl bg-black/5 dark:bg-white/10 text-xl text-emerald-700 dark:text-emerald-400 font-bold"
      >
        {icon}
      </span>
    </article>
  );
}


function ComplaintTable({ complaints, onView, compact = false }) {
  if (compact) {
    return (
      <>
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[42%]" />
              <col className="w-[25%]" />
              <col className="w-[18%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="glass-panel text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Complaint</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {complaints.map((complaint) => (
                <tr key={complaint._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                  <td className="px-5 py-4">
                    <span className="block truncate font-bold text-slate-900 dark:text-white">
                      {complaint.title}
                    </span>
                    <time
                      dateTime={complaint.createdAt}
                      className="mt-1 block text-xs text-slate-500 dark:text-slate-400"
                    >
                      {formatDate(complaint.createdAt)}
                    </time>
                  </td>
                  <td className="truncate px-5 py-4 text-slate-600 dark:text-slate-300">
                    {displayName(complaint.customer)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill status={complaint.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onView(complaint)}
                      className="whitespace-nowrap text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      View details <span aria-hidden="true">→</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="divide-y divide-black/5 dark:divide-white/5 sm:hidden">
          {complaints.map((complaint) => (
            <li key={complaint._id} className="px-4 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 truncate font-bold text-slate-900 dark:text-white">
                  {complaint.title}
                </p>
                <StatusPill status={complaint.status} />
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                {displayName(complaint.customer)}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <time
                  dateTime={complaint.createdAt}
                  className="text-xs text-slate-500 dark:text-slate-400"
                >
                  {formatDate(complaint.createdAt)}
                </time>
                <button
                  type="button"
                  onClick={() => onView(complaint)}
                  className="whitespace-nowrap text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  View details <span aria-hidden="true">→</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-170 text-left text-sm">
        <thead className="glass-panel text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <tr>
            {!compact && <th className="px-5 py-3 font-semibold">ID</th>}
            <th className="px-5 py-3 font-semibold">Complaint</th>
            <th className="px-5 py-3 font-semibold">Customer</th>
            {!compact && (
              <th className="px-5 py-3 font-semibold">Technician</th>
            )}
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 text-right font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/5">
          {complaints.map((complaint) => (
            <tr key={complaint._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
              {!compact && (
                <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-400">
                  {complaintId(complaint)}
                </td>
              )}
              <td className="max-w-64 px-5 py-4">
                <span className="block truncate font-bold text-slate-900 dark:text-white">
                  {complaint.title}
                </span>
                {!compact && (
                  <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                    {complaint.category || "Other"} ·{" "}
                    {complaint.priority || "Medium"}
                  </span>
                )}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-300">
                {displayName(complaint.customer)}
              </td>
              {!compact && (
                <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-300">
                  {displayName(complaint.assignedTo)}
                </td>
              )}
              <td className="px-5 py-4">
                <StatusPill status={complaint.status} />
              </td>
              <td className="px-5 py-4 text-right">
                <button
                  type="button"
                  onClick={() => onView(complaint)}
                  className="whitespace-nowrap text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  View details <span aria-hidden="true">→</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const headerActionsRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignedTechnician, setAssignedTechnician] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [technicianForm, setTechnicianForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialization: "",
    experience: "",
  });
  const [creatingTechnician, setCreatingTechnician] = useState(false);
  const [technicianError, setTechnicianError] = useState("");
  const [technicianMessage, setTechnicianMessage] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      getAdminComplaints(),
      getAdminTechnicians(),
      getAdminCustomers(),
    ])
      .then(([complaintResponse, technicianResponse, customerResponse]) => {
        if (!Array.isArray(complaintResponse.complaints)) {
          throw new Error(
            complaintResponse.message || "Complaints could not be loaded.",
          );
        }
        if (!Array.isArray(technicianResponse.technicians)) {
          throw new Error(
            technicianResponse.message || "Technicians could not be loaded.",
          );
        }
        if (!Array.isArray(customerResponse.customers)) {
          throw new Error(
            customerResponse.message || "Customers could not be loaded.",
          );
        }
        if (active) {
          setComplaints(complaintResponse.complaints);
          setTechnicians(technicianResponse.technicians);
          setCustomers(customerResponse.customers);
          setLoadError("");
        }
      })
      .catch((error) => {
        if (active)
          setLoadError(error.message || "Admin data could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    getNotifications()
      .then((res) => {
        if (active && res?.success) {
          setUnreadNotifCount(res.unreadCount || 0);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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

  const currentPath = location.pathname.replace(/\/$/, "") || "/admin";
  const pageKey =
    currentPath === "/admin" ? "dashboard" : currentPath.replace("/admin/", "");
  const pendingCount = complaints.filter(
    (complaint) => complaint.status === "Pending",
  ).length;
  const inProgressCount = complaints.filter(
    (complaint) => complaint.status === "In Progress",
  ).length;
  const resolvedCount = complaints.filter(
    (complaint) => complaint.status === "Resolved",
  ).length;
  const headingByPage = {
    dashboard: "Dashboard",
    complaints: "Complaints",
    technicians: "Technicians",
    customers: "Customers",
    "technicians/new": "Add Technician",
    analytics: "Analytics",
    settings: "Settings",
  };
  const title = headingByPage[pageKey] || "Dashboard";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const sortedComplaints = [...complaints].sort(
    (first, second) => new Date(second.createdAt) - new Date(first.createdAt),
  );
  const filteredComplaints = sortedComplaints.filter((complaint) => {
    const searchText = search.trim().toLowerCase();
    const matchesSearch =
      !searchText ||
      [
        complaint.title,
        complaintId(complaint),
        complaint.customer?.name,
        complaint.assignedTo?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchText));
    return (
      matchesSearch &&
      (!statusFilter || complaint.status === statusFilter) &&
      (!priorityFilter ||
        (complaint.priority || "Medium") === priorityFilter) &&
      (!categoryFilter || complaint.category === categoryFilter)
    );
  });

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const openComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignedTechnician(complaint.assignedTo?._id || "");
    setAssignmentError("");
  };

  const handleAssignment = async (event) => {
    event.preventDefault();
    if (!selectedComplaint || !assignedTechnician) return;
    setAssigning(true);
    setAssignmentError("");
    try {
      const response = await assignTechnician({
        complaintId: selectedComplaint._id,
        technicianId: assignedTechnician,
      });
      if (!response.complaint) {
        throw new Error(
          response.message || "Technician could not be assigned.",
        );
      }
      setSelectedComplaint(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setAssignmentError(error.message || "Technician could not be assigned.");
    } finally {
      setAssigning(false);
    }
  };

  const handleTechnicianCreate = async (event) => {
    event.preventDefault();
    setCreatingTechnician(true);
    setTechnicianError("");
    setTechnicianMessage("");
    try {
      const response = await createTechnician({
        ...technicianForm,
        experience: Number(technicianForm.experience),
      });
      if (!response.technicianId) {
        throw new Error(response.message || "Technician could not be created.");
      }
      setTechnicianForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        specialization: "",
        experience: "",
      });
      setTechnicianMessage("Technician added successfully.");
      setReloadKey((key) => key + 1);
    } catch (error) {
      setTechnicianError(error.message || "Technician could not be created.");
    } finally {
      setCreatingTechnician(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const inputClass =
    "h-11 w-full rounded-2xl glass-input px-3.5 text-sm outline-none";

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <GlassBackground />
      <aside className="glass-sidebar lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-64 lg:flex-col">
        <div className="flex h-18 items-center justify-between px-6 border-b border-black/5 dark:border-white/10">
          <Link to="/admin" className="flex items-center gap-2 group">
            <span className="font-extrabold text-lg bg-gradient-to-r from-emerald-800 to-teal-700 dark:from-emerald-300 dark:to-teal-200 bg-clip-text text-transparent">
              FixCare Admin
            </span>
          </Link>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>
        <nav
          aria-label="Admin navigation"
          className="flex gap-1 overflow-x-auto px-4 py-3 sm:px-6 lg:flex-1 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-4 lg:py-6"
        >
          {navigation.map((item) => {
            const selected =
              currentPath === item.path ||
              (item.path === "/admin/technicians" &&
                currentPath === "/admin/technicians/new");
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                aria-current={selected ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-all lg:w-full cursor-pointer ${
                  selected
                    ? "bg-emerald-600/15 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/30 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span
                  className="grid h-5 w-5 place-items-center text-base leading-none"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="hidden border-t border-black/5 dark:border-white/10 p-4 lg:block">
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

      <div className="lg:ml-64">
        <header className="sticky top-0 z-20 flex h-18 items-center justify-between px-6 sm:px-8 lg:px-10 glass-header">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">FixCare Operations</p>
          </div>
          <div ref={headerActionsRef} className="relative flex items-center gap-3 sm:gap-4">
            {/* Theme Toggle with Tooltip */}
            <div className="relative group">
              <ThemeToggle />
              <div
                role="tooltip"
                className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900/90 dark:bg-slate-100/90 px-2.5 py-1 text-[11px] font-semibold text-white dark:text-slate-900 shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 z-30"
              >
                {isDark ? "Switch to light mode" : "Switch to dark mode"}
              </div>
            </div>

            {/* Notification Bell with Tooltip */}
            <div className="relative group">
              <button
                type="button"
                aria-label={`${unreadNotifCount} unread notifications`}
                aria-expanded={notificationsOpen}
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                  setProfileOpen(false);
                }}
                className="relative grid h-10 w-10 place-items-center rounded-xl glass-card text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer"
              >
                <span aria-hidden="true">🔔</span>
                {unreadNotifCount > 0 && (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </button>
              <div
                role="tooltip"
                className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900/90 dark:bg-slate-100/90 px-2.5 py-1 text-[11px] font-semibold text-white dark:text-slate-900 shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 z-30"
              >
                {unreadNotifCount > 0 ? `Notifications (${unreadNotifCount} new)` : "Notifications"}
              </div>
              <NotificationPopover
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                onUnreadCountChange={setUnreadNotifCount}
              />
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen((open) => !open);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl glass-card py-1.5 pl-1.5 pr-3 hover:bg-white/80 dark:hover:bg-white/10 cursor-pointer transition text-xs font-bold"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xs">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                <span className="hidden max-w-36 truncate sm:block text-slate-800 dark:text-slate-200">
                  {user?.name || "Admin"}
                </span>
                <span className="text-xs text-slate-400">▾</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl glass-dropdown p-4 shadow-2xl text-xs border border-white/60 dark:border-white/10 animate-in fade-in zoom-in-95 duration-150">
                  <div className="pb-3 border-b border-black/5 dark:border-white/10">
                    <p className="truncate font-bold text-slate-900 dark:text-white">
                      {user?.name || "Admin"}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {user?.email || "admin@fixcare.com"}
                    </p>
                    <span className="mt-1.5 inline-block rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      Administrator
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
                        <span>Profile & Security</span>
                      </span>
                      <span className="text-slate-400">→</span>
                    </Link>
                    <Link
                      to="/admin/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-slate-400">⚙</span>
                        <span>Admin Settings</span>
                      </span>
                      <span className="text-slate-400">→</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-rose-500">🚪</span>
                        <span>Sign out</span>
                      </span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:px-10">
          {pageKey === "dashboard" && (
            <>
              <section className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full glass-card px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2 border border-emerald-500/20">
                    <span>✦</span> Operations Center
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {greeting}, {user?.name?.split(/\s+/)[0] || "Admin"}
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Real-time operational metrics and complaint distribution.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={refreshData}
                  className="rounded-xl glass-card px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10 transition cursor-pointer border border-white/60 dark:border-white/10"
                >
                  Refresh Data
                </button>
              </section>

              {loadError ? (
                <LoadError message={loadError} onRetry={refreshData} />
              ) : (
                <>
                  <section
                    aria-label="Complaint summary"
                    className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                  >
                    <Metric
                      label="Total complaints"
                      value={loading ? "–" : complaints.length}
                      accent="#10b981"
                      icon="▤"
                    />
                    <Metric
                      label="Pending"
                      value={loading ? "–" : pendingCount}
                      accent="#f59e0b"
                      icon="◷"
                    />
                    <Metric
                      label="In progress"
                      value={loading ? "–" : inProgressCount}
                      accent="#0ea5e9"
                      icon="↻"
                    />
                    <Metric
                      label="Resolved"
                      value={loading ? "–" : resolvedCount}
                      accent="#14b8a6"
                      icon="✓"
                    />
                  </section>

                  <section className="mt-10">
                    <div className="mb-4 flex items-end justify-between gap-4 pt-3">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                          Recent complaints
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          Latest reports submitted to FixCare
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate("/admin/complaints")}
                        className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        View all <span aria-hidden="true">→</span>
                      </button>
                    </div>
                    <section className="overflow-hidden rounded-3xl glass-panel border border-white/60 dark:border-white/10 shadow-xl">
                      {loading ? (
                        <LoadingRows />
                      ) : sortedComplaints.length ? (
                        <ComplaintTable
                          complaints={sortedComplaints.slice(0, 6)}
                          onView={openComplaint}
                          compact
                        />
                      ) : (
                        <EmptyState label="No complaints have been submitted yet." />
                      )}
                    </section>
                  </section>
                </>
              )}
            </>
          )}

          {pageKey === "complaints" && (
            <section>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Complaints</h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Search, filter, and assign submitted complaints.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {filteredComplaints.length} shown · {complaints.length} total
                </span>
              </div>
              {loadError ? (
                <LoadError message={loadError} onRetry={refreshData} />
              ) : (
                <>
                  <div className="relative z-30 mb-6 grid gap-3.5 rounded-3xl glass-card p-5 border border-white/60 dark:border-white/10 shadow-lg sm:grid-cols-2 lg:grid-cols-4">
                    <label className="sm:col-span-2 lg:col-span-1">
                      <span className="sr-only">Search complaints</span>
                      <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search complaints..."
                        className={inputClass}
                      />
                    </label>
                    <div className="w-full">
                      <span className="sr-only">Filter by status</span>
                      <GlassSelect
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(event.target.value)
                        }
                        options={[
                          { value: "", label: "All statuses" },
                          ...statusList.map((status) => ({
                            value: status,
                            label: status,
                          })),
                        ]}
                        placeholder="All statuses"
                        ariaLabel="Filter by status"
                      />
                    </div>
                    <div className="w-full">
                      <span className="sr-only">Filter by priority</span>
                      <GlassSelect
                        value={priorityFilter}
                        onChange={(event) =>
                          setPriorityFilter(event.target.value)
                        }
                        options={[
                          { value: "", label: "All priorities" },
                          { value: "High", label: "High" },
                          { value: "Medium", label: "Medium" },
                          { value: "Low", label: "Low" },
                        ]}
                        placeholder="All priorities"
                        ariaLabel="Filter by priority"
                      />
                    </div>
                    <div className="w-full">
                      <span className="sr-only">Filter by category</span>
                      <GlassSelect
                        value={categoryFilter}
                        onChange={(event) =>
                          setCategoryFilter(event.target.value)
                        }
                        options={[
                          { value: "", label: "All categories" },
                          ...[...new Set(complaints.map((item) => item.category))]
                            .filter(Boolean)
                            .sort()
                            .map((category) => ({
                              value: category,
                              label: category,
                            })),
                        ]}
                        placeholder="All categories"
                        ariaLabel="Filter by category"
                      />
                    </div>
                  </div>
                  <section className="relative z-10 overflow-hidden rounded-3xl glass-panel border border-white/60 dark:border-white/10 shadow-xl">
                    {loading ? (
                      <LoadingRows />
                    ) : filteredComplaints.length ? (
                      <ComplaintTable
                        complaints={filteredComplaints}
                        onView={openComplaint}
                      />
                    ) : (
                      <EmptyState label="No complaints match these filters." />
                    )}
                  </section>
                </>
              )}
            </section>
          )}

          {pageKey === "technicians" && (
            <section>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Technicians</h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Technician roster, contact details, and specializations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/admin/technicians/new")}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-700/25 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>+</span> Add technician
                </button>
              </div>
              {loadError ? (
                <LoadError message={loadError} onRetry={refreshData} />
              ) : (
                <section className="overflow-x-auto rounded-3xl glass-panel border border-white/60 dark:border-white/10 shadow-xl">
                  {loading ? (
                    <LoadingRows />
                  ) : technicians.length ? (
                    <table className="w-full min-w-162.5 text-left text-sm">
                      <TableHead
                        columns={[
                          "Technician",
                          "Specialization",
                          "Experience",
                          "Contact",
                          "Status",
                        ]}
                      />
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {technicians.map((technician) => (
                          <tr key={technician._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                            <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                              {technician.name}
                            </td>
                            <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                              <span className="rounded-lg bg-black/5 dark:bg-white/5 px-2.5 py-1 text-xs font-semibold">
                                {technician.specialization || "General"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                              {technician.experience ?? 0} years
                            </td>
                            <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                              <span className="block font-medium">{technician.email}</span>
                              <span className="mt-0.5 block text-xs text-slate-400">
                                {technician.phone}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md ${
                                technician.status === "inactive"
                                  ? "border-slate-400/30 bg-slate-400/15 text-slate-600 dark:text-slate-400"
                                  : "border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${technician.status === "inactive" ? "bg-slate-400" : "bg-emerald-500 animate-pulse"}`} />
                                <span className="capitalize">{technician.status || "active"}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <EmptyState label="No technicians have been added yet." />
                  )}
                </section>
              )}
            </section>
          )}

          {pageKey === "technicians/new" && (
            <section className="max-w-3xl">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Add Technician</h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Create a technician account for the FixCare team.
              </p>
              <form
                onSubmit={handleTechnicianCreate}
                className="mt-6 rounded-3xl glass-card p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-xl"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Full name"
                    name="name"
                    value={technicianForm.name}
                    onChange={setTechnicianForm}
                    required
                  />
                  <FormField
                    label="Email address"
                    name="email"
                    type="email"
                    value={technicianForm.email}
                    onChange={setTechnicianForm}
                    required
                  />
                  <FormField
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={technicianForm.phone}
                    onChange={setTechnicianForm}
                    required
                  />
                  <FormField
                    label="Temporary password"
                    name="password"
                    type="password"
                    value={technicianForm.password}
                    onChange={setTechnicianForm}
                    required
                  />
                  <FormField
                    label="Specialization"
                    name="specialization"
                    value={technicianForm.specialization}
                    onChange={setTechnicianForm}
                  />
                  <FormField
                    label="Years of experience"
                    name="experience"
                    type="number"
                    min="0"
                    value={technicianForm.experience}
                    onChange={setTechnicianForm}
                  />
                </div>
                {technicianError && (
                  <div role="alert" className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-400 font-semibold">
                    {technicianError}
                  </div>
                )}
                {technicianMessage && (
                  <div role="status" className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                    {technicianMessage}
                  </div>
                )}
                <div className="mt-6 flex flex-wrap justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/technicians")}
                    className="rounded-xl border border-slate-300 dark:border-white/15 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingTechnician}
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-700/25 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 transition active:scale-95 cursor-pointer"
                  >
                    {creatingTechnician ? "Adding…" : "Create technician"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {pageKey === "customers" && (
            <section>
              <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Customers</h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Customer accounts registered with FixCare.
                </p>
              </div>
              {loadError ? (
                <LoadError message={loadError} onRetry={refreshData} />
              ) : (
                <section className="overflow-x-auto rounded-3xl glass-panel border border-white/60 dark:border-white/10 shadow-xl">
                  {loading ? (
                    <LoadingRows />
                  ) : customers.length ? (
                    <table className="w-full min-w-150 text-left text-sm">
                      <TableHead
                        columns={[
                          "Customer",
                          "Email",
                          "Phone",
                          "Complaints",
                          "Joined",
                        ]}
                      />
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {customers.map((customer) => (
                          <tr key={customer._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                            <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                              {customer.name}
                            </td>
                            <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                              {customer.email}
                            </td>
                            <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                              {customer.phone || "—"}
                            </td>
                            <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-semibold">
                              {
                                complaints.filter(
                                  (item) => item.customer?._id === customer._id,
                                ).length
                              }
                            </td>
                            <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                              {formatDate(customer.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <EmptyState label="No customer accounts found." />
                  )}
                </section>
              )}
            </section>
          )}

          {pageKey === "analytics" && (
            <section>
              <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Analytics</h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  A live breakdown of all submitted complaints.
                </p>
              </div>
              {loadError ? (
                <LoadError message={loadError} onRetry={refreshData} />
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  <AnalyticsGroup
                    title="By status"
                    total={complaints.length}
                    items={statusList.map((status) => ({
                      label: status,
                      count: complaints.filter((item) => item.status === status)
                        .length,
                    }))}
                    loading={loading}
                  />
                  <AnalyticsGroup
                    title="By category"
                    total={complaints.length}
                    items={[...new Set(complaints.map((item) => item.category))]
                      .filter(Boolean)
                      .sort()
                      .map((category) => ({
                        label: category,
                        count: complaints.filter(
                          (item) => item.category === category,
                        ).length,
                      }))}
                    loading={loading}
                  />
                  <AnalyticsGroup
                    title="By priority"
                    total={complaints.length}
                    items={["High", "Medium", "Low"].map((priority) => ({
                      label: priority,
                      count: complaints.filter(
                        (item) => (item.priority || "Medium") === priority,
                      ).length,
                    }))}
                    loading={loading}
                  />
                  <article className="rounded-3xl glass-card p-6 sm:p-7 border border-white/60 dark:border-white/10 shadow-xl">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Team overview</h2>
                    <dl className="mt-5 divide-y divide-black/5 dark:divide-white/5 text-sm">
                      <div className="flex justify-between py-3">
                        <dt className="text-slate-500 dark:text-slate-400">Technicians</dt>
                        <dd className="font-bold text-slate-900 dark:text-white">
                          {loading ? "–" : technicians.length}
                        </dd>
                      </div>
                      <div className="flex justify-between py-3">
                        <dt className="text-slate-500 dark:text-slate-400">Customers</dt>
                        <dd className="font-bold text-slate-900 dark:text-white">
                          {loading ? "–" : customers.length}
                        </dd>
                      </div>
                      <div className="flex justify-between py-3">
                        <dt className="text-slate-500 dark:text-slate-400">Resolved rate</dt>
                        <dd className="font-bold text-emerald-600 dark:text-emerald-400">
                          {loading || !complaints.length
                            ? "–"
                            : `${Math.round((resolvedCount / complaints.length) * 100)}%`}
                        </dd>
                      </div>
                    </dl>
                  </article>
                </div>
              )}
            </section>
          )}

          {pageKey === "settings" && (
            <section className="max-w-3xl">
              <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Settings</h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Admin account and workspace access.
                </p>
              </div>
              <article className="rounded-3xl glass-card p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-xl">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Administrator account</h2>
                <dl className="mt-5 divide-y divide-black/5 dark:divide-white/5 text-sm">
                  <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr]">
                    <dt className="text-slate-500 dark:text-slate-400">Name</dt>
                    <dd className="font-bold text-slate-900 dark:text-white">{user?.name || "Admin"}</dd>
                  </div>
                  <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr]">
                    <dt className="text-slate-500 dark:text-slate-400">Email</dt>
                    <dd className="font-bold text-slate-900 dark:text-white">{user?.email || "—"}</dd>
                  </div>
                  <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr]">
                    <dt className="text-slate-500 dark:text-slate-400">Access level</dt>
                    <dd className="font-bold capitalize text-emerald-600 dark:text-emerald-400">
                      {user?.role || "admin"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-black/5 dark:border-white/10 pt-6">
                  <Link
                    to="/profile"
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 text-xs font-bold text-white shadow-md shadow-emerald-700/25 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95"
                  >
                    Manage Profile & Security →
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="h-11 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              </article>
            </section>
          )}
        </main>
      </div>

      {selectedComplaint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setSelectedComplaint(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-complaint-title"
            className="my-auto w-full max-w-xl rounded-3xl glass-panel p-7 sm:p-9 shadow-2xl border border-white/60 dark:border-white/10 text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Complaint {complaintId(selectedComplaint)}
                </p>
                <h2
                  id="admin-complaint-title"
                  className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white"
                >
                  {selectedComplaint.title}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close complaint details"
                onClick={() => setSelectedComplaint(null)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <StatusPill status={selectedComplaint.status} />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {selectedComplaint.category} ·{" "}
                <strong className="text-slate-700 dark:text-slate-200">{selectedComplaint.priority || "Medium"}</strong> priority
              </span>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {selectedComplaint.description || "No description provided."}
            </p>
            <dl className="mt-5 grid gap-3 border-t border-black/5 dark:border-white/10 pt-4 text-xs sm:grid-cols-2">
              <div>
                <dt className="uppercase tracking-wider text-slate-400">
                  Customer
                </dt>
                <dd className="mt-1 font-bold text-slate-800 dark:text-slate-200">
                  {displayName(selectedComplaint.customer)}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider text-slate-400">
                  Created
                </dt>
                <dd className="mt-1 font-bold text-slate-800 dark:text-slate-200">
                  {formatDate(selectedComplaint.createdAt)}
                </dd>
              </div>
            </dl>
            <form
              onSubmit={handleAssignment}
              className="mt-6 border-t border-black/5 dark:border-white/10 pt-5 relative z-20"
            >
              <label
                htmlFor="assign-technician"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
              >
                Assign technician
              </label>
              <div className="flex flex-col gap-3 sm:flex-row relative z-30">
                <GlassSelect
                  value={assignedTechnician}
                  onChange={(event) =>
                    setAssignedTechnician(event.target.value)
                  }
                  options={[
                    { value: "", label: "Select a technician" },
                    ...technicians.map((technician) => ({
                      value: technician._id,
                      label: `${technician.name} · ${technician.specialization || "General"}`,
                    })),
                  ]}
                  placeholder="Select a technician"
                  ariaLabel="Assign technician"
                  className="flex-1"
                />
                <button
                  type="submit"
                  disabled={assigning || !technicians.length}
                  className="h-11 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 text-xs font-bold text-white shadow-md shadow-emerald-700/25 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition cursor-pointer active:scale-95"
                >
                  {assigning ? "Saving…" : "Save assignment"}
                </button>
              </div>
              {assignmentError && (
                <p role="alert" className="mt-2 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  {assignmentError}
                </p>
              )}
              {!technicians.length && (
                <p className="mt-2 text-xs text-slate-400">
                  Add a technician before assigning this complaint.
                </p>
              )}
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function TableHead({ columns }) {
  return (
    <thead className="glass-panel text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
      <tr>
        {columns.map((column) => (
          <th key={column} className="px-5 py-3.5 font-semibold">
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  min,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(event) =>
          onChange((previous) => ({ ...previous, [name]: event.target.value }))
        }
        min={min}
        required={required}
        className="h-11 w-full rounded-2xl glass-input px-3.5 text-sm outline-none"
      />
    </label>
  );
}

function AnalyticsGroup({ title, total, items, loading }) {
  return (
    <article className="rounded-3xl glass-card p-6 sm:p-7 border border-white/60 dark:border-white/10 shadow-xl">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      {loading ? (
        <p className="mt-5 text-xs text-slate-400">Loading…</p>
      ) : items.length ? (
        <div className="mt-5 space-y-4">
          {items.map((item) => {
            const percent = total ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.label}>
                <div className="mb-1.5 flex justify-between gap-3 text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.label}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.count}{" "}
                    <span className="font-normal text-[11px] text-slate-400">
                      ({percent}%)
                    </span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-[width]"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-5 text-xs text-slate-400">No records to summarize.</p>
      )}
    </article>
  );
}

function LoadError({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="rounded-3xl glass-card p-8 text-center border border-white/60 dark:border-white/10 shadow-lg"
    >
      <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-4 p-6" aria-label="Loading data" aria-live="polite">
      {[1, 2, 3].map((row) => (
        <div key={row} className="h-12 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
      ))}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <p className="px-6 py-12 text-center text-xs text-slate-500 dark:text-slate-400">{label}</p>
  );
}

export default AdminDashboard;

