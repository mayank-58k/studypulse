export default function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block space-y-1">
      {label ? <span className="text-sm text-white/70">{label}</span> : null}
      <input className={`input ${className}`} {...props} />
      {error ? <span className="text-xs text-rose-400">{error}</span> : null}
    </label>
  );
}
