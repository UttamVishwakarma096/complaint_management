import { useEffect, useRef, useState } from "react";

/**
 * Glassmorphic Select Component
 * Provides a frosted glass floating dropdown that perfectly matches the FixCare aesthetic.
 */
export default function GlassSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  className = "",
  ariaLabel,
  icon,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const containerRef = useRef(null);

  // Normalize options to [{ value, label }]
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return opt;
    }
    return { value: opt, label: opt };
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));
  const displayText = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Flip upwards if less than 240px below and more room above
      if (spaceBelow < 240 && rect.top > spaceBelow) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("pointerdown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    setIsOpen(false);
    if (onChange) {
      // Provide synthetic event so standard `(e) => setFilter(e.target.value)` works drop-in
      onChange({ target: { value: val }, currentTarget: { value: val } });
    }
  };

  return (
    <div ref={containerRef} className={`relative ${isOpen ? "z-50" : "z-10"} ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || displayText}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-11 w-full items-center justify-between gap-2 rounded-2xl glass-input px-3.5 text-sm text-left outline-none cursor-pointer transition-all hover:bg-white/90 dark:hover:bg-white/10 active:scale-[0.99] ${
          isOpen ? "ring-2 ring-emerald-500/40 border-emerald-500/60" : ""
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          <span className={!value && placeholder ? "text-slate-500 dark:text-slate-400 font-normal" : "font-semibold text-slate-800 dark:text-slate-100"}>
            {displayText}
          </span>
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 ${
            openUpwards ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"
          } z-50 w-full min-w-[160px] rounded-2xl glass-dropdown p-1.5 shadow-2xl border border-white/60 dark:border-white/10 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto`}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition cursor-pointer text-left ${
                  isSelected
                    ? "bg-emerald-600/15 text-emerald-800 dark:bg-emerald-500/25 dark:text-emerald-300 font-bold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 hover:text-emerald-700 dark:hover:text-emerald-300"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs shrink-0">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
