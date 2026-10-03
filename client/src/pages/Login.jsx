import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GlassBackground from "../components/GlassBackground";
import ThemeToggle from "../components/ThemeToggle";
import { login } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const loginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    try {
      const response = await login(user);
      if (response.user) {
        loginUser(response.user);

        if (response.user.role === "admin") {
          navigate("/admin");
        } else if (response.user.role === "technician") {
          navigate("/technician");
        } else {
          navigate("/dashboard");
        }
      } else {
        setErrorMessage(response.message || "Login failed");
      }
    } catch (error) {
      setErrorMessage(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const setUserData = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <main className="relative min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <GlassBackground />

      <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
        {/* Left Branding Showcase Section */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16 border-r border-white/10">
          <div className="ambient-orb-1 absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="ambient-orb-2 absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />

          <Link
            to="/"
            className="relative z-10 flex w-fit items-center gap-2.5 text-base font-extrabold tracking-tight group"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold shadow-md shadow-emerald-500/30">
              F
            </span>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-200 to-teal-100 bg-clip-text text-transparent">
              FixCare
            </span>
          </Link>

          <div className="relative z-10 max-w-lg pb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300 border border-white/10 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Complaint Management Redefined
            </div>
            <h1 className="font-extrabold text-4xl leading-tight xl:text-5xl bg-gradient-to-br from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
              Better service starts with being heard.
            </h1>
            <p className="mt-5 text-sm sm:text-base leading-relaxed text-slate-300">
              One unified glassmorphic platform to raise issues, monitor progress,
              and connect with certified repair technicians.
            </p>

            <div className="mt-8 rounded-2xl bg-white/5 backdrop-blur-md p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <span className="inline-block h-8 w-8 rounded-full border-2 border-emerald-950 bg-emerald-600 text-center text-xs leading-7 font-bold">
                    JD
                  </span>
                  <span className="inline-block h-8 w-8 rounded-full border-2 border-emerald-950 bg-teal-600 text-center text-xs leading-7 font-bold">
                    AR
                  </span>
                  <span className="inline-block h-8 w-8 rounded-full border-2 border-emerald-950 bg-amber-600 text-center text-xs leading-7 font-bold">
                    SK
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white">4,000+ residents</span> trust FixCare
                </div>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-400">
            FixCare Enterprise Portal • Glassmorphic Security Protocol
          </p>
        </section>

        {/* Right Form Section */}
        <section className="flex min-h-screen flex-col justify-between px-6 py-8 sm:px-10 lg:px-14 xl:px-20">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-bold lg:hidden"
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
                F
              </span>
              <span>FixCare</span>
            </Link>
            <div className="ml-auto flex items-center gap-4">
              <ThemeToggle />
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                New here?{" "}
                <Link
                  to="/signup"
                  className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>

          <div className="mx-auto my-auto w-full max-w-md py-8">
            <div className="rounded-3xl glass-panel p-7 sm:p-9 shadow-2xl border border-white/70 dark:border-white/10">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Welcome back
                </span>
                <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Sign in to FixCare
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Access your service reports and live updates.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={loginSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={user.email}
                    onChange={setUserData}
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    className="h-11 w-full rounded-xl glass-input px-3.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                    >
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      value={user.password}
                      onChange={setUserData}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      required
                      className="h-11 w-full rounded-xl glass-input px-3.5 pr-14 text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 px-3.5 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Signing in..." : "Sign in"}
                  <span aria-hidden="true">→</span>
                </button>
              </form>

              <div className="my-6 flex items-center gap-3 text-[11px] text-slate-400">
                <span className="h-px flex-1 bg-black/5 dark:bg-white/10" />
                <span>SECURE ACCESS</span>
                <span className="h-px flex-1 bg-black/5 dark:bg-white/10" />
              </div>

              <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                By signing in, you agree to FixCare's Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>

          <footer className="flex flex-wrap justify-between gap-4 border-t border-black/5 dark:border-white/10 pt-4 text-xs text-slate-400">
            <span>© 2026 FixCare</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Privacy</a>
              <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Help Center</a>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
};

export default Login;
