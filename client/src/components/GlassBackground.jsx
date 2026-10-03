export default function GlassBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Primary Emerald/Teal Glow Orb */}
      <div className="ambient-orb-1 absolute -top-40 -left-40 h-[38rem] w-[38rem] rounded-full bg-gradient-to-br from-emerald-400/25 via-teal-300/15 to-transparent blur-[100px] dark:from-emerald-500/20 dark:via-teal-600/15 dark:to-transparent" />

      {/* Amber/Coral Warm Glow Orb */}
      <div className="ambient-orb-2 absolute top-1/3 -right-32 h-[34rem] w-[34rem] rounded-full bg-gradient-to-br from-amber-300/20 via-orange-300/10 to-transparent blur-[110px] dark:from-cyan-500/15 dark:via-emerald-700/10 dark:to-transparent" />

      {/* Deep Sage / Indigo Lower Orb */}
      <div className="ambient-orb-1 absolute -bottom-48 left-1/3 h-[42rem] w-[42rem] rounded-full bg-gradient-to-tr from-emerald-600/15 via-teal-500/10 to-transparent blur-[120px] dark:from-emerald-900/25 dark:via-cyan-950/20 dark:to-transparent" />

      {/* Micro-dot grid texture for tactile depth */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}
