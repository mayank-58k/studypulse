export default function Badge({ children, color = "bg-white/10 text-white" }) {
  return <span className={`text-xs px-2 py-1 rounded-full ${color}`}>{children}</span>;
}
