import { Link } from "react-router-dom";
import GlassBackground from "../components/GlassBackground";
import ThemeToggle from "../components/ThemeToggle";
import StatusBadge from "../components/StatusBadge";

const Landing = () => {
  return (
    <main className="relative min-h-screen overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <GlassBackground />

      {/* Floating Glass Header */}
      <header className="sticky top-4 z-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between rounded-2xl glass-panel px-6 sm:px-8 border border-white/60 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-base font-extrabold tracking-tight group"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold shadow-md shadow-emerald-600/30 group-hover:scale-105 transition">
              F
            </span>
            <span className="bg-gradient-to-r from-emerald-800 to-teal-700 dark:from-emerald-300 dark:to-teal-200 bg-clip-text text-transparent">
              FixCare
            </span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-4 text-sm font-semibold">
            <ThemeToggle />
            <Link
              to="/login"
              className="px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-2 text-white shadow-md shadow-emerald-700/25 hover:from-emerald-600 hover:to-teal-600 transition active:scale-95"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto grid min-h-[calc(100vh-100px)] w-full max-w-7xl items-center gap-12 px-6 pb-20 pt-8 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full glass-panel px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 mb-6 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Reliable help, connected simply
          </div>

          <h1 className="font-extrabold text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-900 dark:from-white dark:via-emerald-100 dark:to-teal-300 bg-clip-text text-transparent">
            Fix it once. <br />
            <span className="underline decoration-emerald-500/40 underline-offset-8">
              Fix it right.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            FixCare connects residents with certified service professionals in real-time.
            File tickets in seconds, track milestones dynamically, and enjoy transparent resolutions.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/signup"
              className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 flex items-center gap-2"
            >
              Create an account
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/login"
              className="rounded-2xl glass-panel px-6 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-white/15 hover:bg-white/90 dark:hover:bg-white/10 transition active:scale-95"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl glass-card p-4 border border-white/50 dark:border-white/10">
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">99.4%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Resolution rate</p>
            </div>
            <div className="rounded-2xl glass-card p-4 border border-white/50 dark:border-white/10">
              <p className="text-2xl font-black text-teal-700 dark:text-teal-400">&lt; 2 hrs</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Avg response</p>
            </div>
            <div className="rounded-2xl glass-card p-4 border border-white/50 dark:border-white/10 col-span-2 sm:col-span-1">
              <p className="text-2xl font-black text-cyan-700 dark:text-cyan-400">4.9 ★</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">User satisfaction</p>
            </div>
          </div>
        </div>

        {/* Hero Glass Mockup Card */}
        <div className="relative">
          <div className="relative mx-auto w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 shadow-2xl border border-white/80 dark:border-white/15 transition-all hover:scale-[1.01] duration-300">
            {/* Glossy top edge highlight */}
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />

            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Service Ticket #FC-8942
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  HVAC & Climate Control
                </p>
              </div>
              <StatusBadge status="In Progress" />
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3.5">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white font-bold">
                  ✓
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Complaint Registered
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Today, 09:30 AM • Priority: High</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] text-white font-bold">
                  ✓
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Technician Dispatched
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Alex Rivera (Master Electrician)</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/20 animate-pulse" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Diagnostics & Active Repair
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">On site • Estimated completion: 45 min</p>
                </div>
              </div>
            </div>

            {/* Inner Glass Box */}
            <div className="mt-6 rounded-2xl glass-card p-4 border border-white/60 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm shadow-md">
                  AR
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Alex Rivera</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Assigned Technician ★ 4.9</p>
                </div>
              </div>
              <span className="rounded-lg bg-emerald-500/15 dark:bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                Verified
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Landing;
