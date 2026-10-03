import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GlassBackground from "../components/GlassBackground";
import ThemeToggle from "../components/ThemeToggle";
import { signup } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const signupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    try {
      const response = await signup(user);
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
        setErrorMessage(response.message || "Registration failed");
      }
    } catch (error) {
      setErrorMessage(error.message || "Registration error occurred");
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
        {/* Left Hero Section */}
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
              Join Our Community
            </div>
            <h1 className="font-extrabold text-4xl leading-tight xl:text-5xl bg-gradient-to-br from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
              Make your voice part of the solution.
            </h1>
            <p className="mt-5 text-sm sm:text-base leading-relaxed text-slate-300">
              Create an account to report facility and appliance issues, track technician milestones in real-time, and get swift resolutions.
            </p>

            <div className="mt-8 rounded-2xl bg-white/5 backdrop-blur-md p-4 border border-white/10 text-xs leading-relaxed text-slate-300">
              ✨ Free instant onboarding • End-to-end status tracking • Automated technician assignment
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-400">
            FixCare Service Ecosystem • Certified Resolution Network
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
                Already registered?{" "}
                <Link
                  to="/login"
                  className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <div className="mx-auto my-auto w-full max-w-md py-6">
            <div className="rounded-3xl glass-panel p-7 sm:p-9 shadow-2xl border border-white/70 dark:border-white/10">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Get Started
                </span>
                <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Create your account
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Sign up in under 60 seconds to submit tickets.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <form className="space-y-3.5" onSubmit={signupSubmit}>
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={user.name}
                    onChange={setUserData}
                    placeholder="Jane Doe"
                    required
                    className="h-10 w-full rounded-xl glass-input px-3.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
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
                    className="h-10 w-full rounded-xl glass-input px-3.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                  >
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={user.phone}
                    onChange={setUserData}
                    placeholder="+1 555-0199"
                    required
                    className="h-10 w-full rounded-xl glass-input px-3.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      value={user.password}
                      onChange={setUserData}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      required
                      className="h-10 w-full rounded-xl glass-input px-3.5 pr-14 text-sm outline-none"
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
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Creating account..." : "Complete Sign Up"}
                  <span aria-hidden="true">→</span>
                </button>
              </form>

              <p className="mt-5 text-center text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                By joining FixCare, you agree to our standard Community Guidelines.
              </p>
            </div>
          </div>

          <footer className="flex flex-wrap justify-between gap-4 border-t border-black/5 dark:border-white/10 pt-4 text-xs text-slate-400">
            <span>© 2026 FixCare</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Privacy</a>
              <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Terms</a>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
};

export default Signup;
