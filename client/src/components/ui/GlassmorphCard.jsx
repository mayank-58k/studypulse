export default function GlassmorphCard({
  children,
  className = "",
  glow = false,
  borderColor = "border-white/10"
}) {
  return (
    <div
      className={`
        rounded-2xl
        bg-white/5
        backdrop-blur-xl
        border
        ${borderColor}
        p-6
        shadow-xl
        transition-all
        duration-300
        ${glow ? "animate-glow" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
