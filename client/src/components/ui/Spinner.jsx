export default function Spinner({ text = "Loading..." }) {
  return (
    <div className="min-h-[180px] flex items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-white/70">
        <div className="h-5 w-5 rounded-full border-2 border-gold-400 border-t-transparent animate-spin" />
        <span>{text}</span>
      </div>
    </div>
  );
}
