import { Lock } from 'lucide-react';

export default function BadgeCard({ badge, earned, progress, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
        earned
          ? 'bg-white/5 border-neon-primary/30 shadow-[0_0_15px_rgba(0,255,136,0.1)]'
          : 'bg-navy-800/50 border-white/5 grayscale opacity-60'
      }`}
    >
      <div className="text-2xl mb-2">{badge.emoji}</div>
      <p className="text-sm font-semibold text-white">{badge.title}</p>
      <p className="text-xs text-white/50 mt-1">{badge.description}</p>
      {!earned && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-white/40 mb-1">
            {progress && <span>{progress.current}/{progress.target}</span>}
            <Lock size={10} className="ml-auto" />
          </div>
          {progress && (
            <div className="h-1 bg-navy-700 rounded-full overflow-hidden">
              <div className="h-full bg-neon-primary/50 rounded-full" style={{ width: `${progress.percent}%` }} />
            </div>
          )}
        </div>
      )}
      {earned && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neon-primary animate-pulse" />}
    </div>
  );
}
