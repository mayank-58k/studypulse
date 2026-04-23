export default function SkeletonLoader({
  count = 1,
  height = "h-4",
  width = "w-full",
  className = "",
  circle = false
}) {
  const skeletons = Array(count).fill(0);

  return (
    <div className={`space-y-3 ${className}`}>
      {skeletons.map((_, idx) => (
        <div
          key={idx}
          className={`
            bg-gradient-to-r
            from-white/5
            via-white/10
            to-white/5
            animate-pulse
            rounded-lg
            ${circle ? "rounded-full" : ""}
            ${height}
            ${width}
          `}
        />
      ))}
    </div>
  );
}
