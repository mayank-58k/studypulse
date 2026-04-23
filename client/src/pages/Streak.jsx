import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Button from "../components/ui/Button";
import SkeletonLoader from "../components/ui/SkeletonLoader";
import ConfettiEffect from "../components/ui/ConfettiEffect";
import useLocalStorage from "../hooks/useLocalStorage";
import useStreak from "../hooks/useStreak";
import { STREAK_CONFETTI_MILESTONES } from "../utils/badgeHelpers";

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMilestoneMessage(count) {
  if (count >= 365) return { msg: "You're a legend! 👑 365 days!", emoji: "👑" };
  if (count >= 100) return { msg: "Century club! 💎 100 days!", emoji: "💎" };
  if (count >= 30) return { msg: "One month streak! 🔥 Amazing!", emoji: "🔥" };
  if (count >= 7) return { msg: "One week streak! Keep going!", emoji: "🔥" };
  if (count >= 3) return { msg: "3 days in a row! You're on fire!", emoji: "🔥" };
  return null;
}

export default function Streak() {
  const { streak, loading, refresh } = useStreak();
  const [heatmap, setHeatmap] = useState({});
  const [freeze, setFreeze] = useLocalStorage("studypulse_streak_freeze", { usedAt: null });
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [checkinLoading, setCheckinLoading] = useState(false);

  useEffect(() => {
    api.get("/sessions/heatmap").then(({ data }) => setHeatmap(data));
  }, []);

  const last7 = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ key, minutes: heatmap[key] || 0, isToday: i === 0, label: DAY_LABELS[d.getDay()] });
    }
    return out;
  }, [heatmap]);

  const studiedToday = last7[last7.length - 1]?.minutes > 0;
  const milestoneMsg = getMilestoneMessage(streak.streakCount);
  const isMilestone = STREAK_CONFETTI_MILESTONES.includes(streak.streakCount);

  const handleCheckin = async () => {
    setCheckinLoading(true);
    try {
      await api.post("/streak/checkin");
      await refresh();
      if (isMilestone) setConfettiTrigger(t => t + 1);
    } finally { setCheckinLoading(false); }
  };

  const useFreeze = async () => {
    const now = new Date();
    const lastUsed = freeze.usedAt ? new Date(freeze.usedAt) : null;
    if (lastUsed && (now - lastUsed) / (1000 * 60 * 60 * 24) < 7) return;
    setFreeze({ usedAt: now.toISOString() });
  };

  if (loading) return <div className="space-y-4"><SkeletonLoader height="h-48" /><SkeletonLoader height="h-32" /></div>;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <ConfettiEffect trigger={confettiTrigger} />

      {/* Main streak display */}
      <div className="card p-8 text-center">
        <div className="text-7xl animate-flicker mb-2">🔥</div>
        <div className="text-6xl font-mono font-bold" style={{ color: '#00ff88', textShadow: '0 0 30px rgba(0,255,136,0.5)' }}>
          {streak.streakCount}
        </div>
        <p className="text-white/60 mt-2 text-lg">{streak.streakCount} days with StudyPulse!</p>
        {milestoneMsg && (
          <div className="mt-3 px-4 py-2 rounded-xl inline-block" style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)' }}>
            <p className="text-neon-primary font-semibold">{milestoneMsg.msg}</p>
          </div>
        )}
      </div>

      {/* Streak info */}
      <div className="card p-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-3xl">🔥</p>
          <p className="text-2xl font-mono font-bold text-neon-primary mt-1">{streak.streakCount}</p>
          <p className="text-xs text-white/50 mt-1">Current Streak</p>
        </div>
        <div className="text-center">
          <p className="text-3xl">👑</p>
          <p className="text-2xl font-mono font-bold text-yellow-400 mt-1">{streak.longestStreak || 0}</p>
          <p className="text-xs text-white/50 mt-1">Best Streak</p>
        </div>
      </div>

      {/* Streak at risk warning */}
      {!studiedToday && (
        <div className="card p-4 animate-pulse-danger" style={{ borderColor: 'rgba(255,107,53,0.4)', border: '1px solid' }}>
          <p className="text-neon-warning font-semibold text-center">⚠️ Study today to keep your streak!</p>
          <p className="text-xs text-white/50 text-center mt-1">You haven't studied yet today. Your streak is at risk!</p>
        </div>
      )}

      {/* Daily check-in circles */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-4">Last 7 Days</h3>
        <div className="flex justify-between gap-1">
          {last7.map((d) => (
            <div key={d.key} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                d.minutes > 0 ? 'bg-neon-primary/20 border-2 border-neon-primary' : 'bg-navy-700 border-2 border-white/10'
              } ${d.isToday ? 'ring-2 ring-neon-primary/50 ring-offset-1 ring-offset-transparent' : ''}`}>
                {d.minutes > 0 ? <span className="text-neon-primary text-sm">✓</span> : <span className="text-white/30 text-xs">—</span>}
              </div>
              <span className="text-[10px] text-white/50">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <Button className="flex-1" onClick={handleCheckin} disabled={checkinLoading}>
          {checkinLoading ? "Checking in..." : "✓ Check In Today"}
        </Button>
        <div className="flex-1 flex flex-col items-center gap-1">
          <Button variant="secondary" className="w-full flex items-center gap-2 justify-center" onClick={useFreeze}>
            🧊 Use Streak Freeze
          </Button>
          <p className="text-xs text-white/40">
            {freeze.usedAt ? `Last used: ${new Date(freeze.usedAt).toLocaleDateString()}` : "Available (once/week)"}
          </p>
        </div>
      </div>
    </div>
  );
}
