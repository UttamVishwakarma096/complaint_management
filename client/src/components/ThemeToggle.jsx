import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "", showLabel = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`group relative inline-flex items-center justify-center rounded-xl p-2.5 transition-all duration-300 backdrop-blur-md cursor-pointer 
        bg-white/40 hover:bg-white/70 text-[#1e483e] border border-white/60 shadow-xs hover:shadow-md
        dark:bg-white/10 dark:hover:bg-white/15 dark:text-emerald-300 dark:border-white/10 dark:shadow-[0_0_15px_rgba(16,185,129,0.15)]
        active:scale-95 ${className}`}
    >
      <div className="relative h-5 w-5">
        {/* Sun Icon */}
        <svg
          className={`absolute inset-0 h-5 w-5 transform transition-all duration-500 ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 text-amber-600"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>

        {/* Moon Icon */}
        <svg
          className={`absolute inset-0 h-5 w-5 transform transition-all duration-500 ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-emerald-400"
              : "-rotate-90 scale-0 opacity-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>

      {showLabel && (
        <span className="ml-2.5 text-xs font-semibold tracking-wide">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}
