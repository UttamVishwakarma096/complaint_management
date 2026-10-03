import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GlassBackground from "../components/GlassBackground";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import {
  changePassword,
  getUserProfile,
  updateUserProfile,
} from "../services/api";

export default function Profile() {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    specialization: "",
    experience: "",
  });
  const [loading, setLoading] = useState(true);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    getUserProfile()
      .then((res) => {
        if (res.success && res.profile) {
          setProfile({
            name: res.profile.name || "",
            email: res.profile.email || "",
            phone: res.profile.phone || "",
            role: res.profile.role || "",
            specialization: res.profile.specialization || "",
            experience: res.profile.experience || "",
          });
        }
      })
      .catch((err) => {
        setProfileMsg({ type: "error", text: err.message || "Failed to load profile." });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: "", text: "" });

    try {
      const res = await updateUserProfile({
        name: profile.name,
        phone: profile.phone,
        specialization: profile.specialization,
        experience: profile.experience,
      });

      if (res.success) {
        setProfileMsg({ type: "success", text: "Profile updated successfully." });
        if (user) {
          loginUser({ ...user, name: profile.name });
        }
      } else {
        setProfileMsg({ type: "error", text: res.message || "Failed to update profile." });
      }
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message || "Something went wrong." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });

    if (passwords.newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      if (res.success) {
        setPasswordMsg({ type: "success", text: "Password changed successfully!" });
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPasswordMsg({ type: "error", text: res.message || "Failed to update password." });
      }
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.message || "Something went wrong." });
    } finally {
      setSavingPassword(false);
    }
  };

  const backLink =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "technician"
      ? "/technician"
      : "/dashboard";

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <GlassBackground />

      <header className="sticky top-0 z-30 glass-header">
        <div className="mx-auto flex h-18 max-w-4xl items-center justify-between px-5 sm:px-8">
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
              onClick={() => navigate(backLink)}
              className="flex items-center gap-1.5 rounded-xl glass-card px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition cursor-pointer"
            >
              <span>←</span> Return to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full glass-card px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2 border border-emerald-500/20">
            <span>⚙</span> Profile & Credentials
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Account Settings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your personal profile and security preferences.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="h-96 rounded-3xl glass-card animate-pulse" />
            <div className="h-96 rounded-3xl glass-card animate-pulse" />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {/* Personal Details Form */}
            <section className="rounded-3xl glass-card p-6 sm:p-8 shadow-xl border border-white/60 dark:border-white/10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Profile Information
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Update your contact details visible to support staff.
              </p>

              {profileMsg.text && (
                <div
                  className={`mt-4 rounded-2xl p-3 text-xs font-bold ${
                    profileMsg.type === "success"
                      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, name: e.target.value }))
                    }
                    className="h-11 w-full rounded-2xl glass-input px-3.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="h-11 w-full rounded-2xl border border-slate-300/40 dark:border-white/5 bg-black/5 dark:bg-white/5 px-3.5 text-sm text-slate-400 cursor-not-allowed outline-none"
                  />
                  <span className="mt-1 block text-[10px] text-slate-400">
                    Email cannot be changed directly for security purposes.
                  </span>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="h-11 w-full rounded-2xl glass-input px-3.5 text-sm outline-none"
                  />
                </div>

                {profile.role === "technician" && (
                  <>
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={profile.specialization}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            specialization: e.target.value,
                          }))
                        }
                        placeholder="e.g. Electrical, Plumbing, HVAC"
                        className="h-11 w-full rounded-2xl glass-input px-3.5 text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={profile.experience}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            experience: e.target.value,
                          }))
                        }
                        className="h-11 w-full rounded-2xl glass-input px-3.5 text-sm outline-none"
                      />
                    </div>
                  </>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 font-bold text-white shadow-md shadow-emerald-700/25 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 cursor-pointer transition active:scale-95 text-xs"
                  >
                    {savingProfile ? "Saving..." : "Save Profile Changes"}
                  </button>
                </div>
              </form>
            </section>

            {/* Change Password Form */}
            <section className="rounded-3xl glass-card p-6 sm:p-8 shadow-xl border border-white/60 dark:border-white/10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Security & Password
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Ensure your account is protected with a secure password.
              </p>

              {passwordMsg.text && (
                <div
                  className={`mt-4 rounded-2xl p-3 text-xs font-bold ${
                    passwordMsg.type === "success"
                      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords((p) => ({
                        ...p,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-2xl glass-input px-3.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    New Password (min 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords((p) => ({
                        ...p,
                        newPassword: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-2xl glass-input px-3.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-2xl glass-input px-3.5 text-sm outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 font-bold text-white shadow-md shadow-teal-700/25 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 cursor-pointer transition active:scale-95 text-xs"
                  >
                    {savingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
