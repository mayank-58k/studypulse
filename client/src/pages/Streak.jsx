import { useEffect, useMemo, useState } from "react";
import { Flame } from "lucide-react";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import useLocalStorage from "../hooks/useLocalStorage";
import useStreak from "../hooks/useStreak";
import { getStreakMessage, streakMilestones } from "../utils/streakHelpers";

export default function Streak() {
  const { streak, loading, refresh } = useStreak();
  const [heatmap, setHeatmap] = useState({});
  const [freeze, setFreeze] = useLocalStorage("studypulse_streak_freeze", { usedAt: null });

  const loadHeatmap = async () => {
    const { data } = await api.get("/sessions/heatmap");
    setHeatmap(data);
  };

  useEffect(() => {
    loadHeatmap();
  }, []);

  const last7 = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ key, minutes: heatmap[key] || 0 });
    }
    return out;
  }, [heatmap]);

  const useFreeze = async () => {
    const now = new Date();
    const lastUsed = freeze.usedAt ? new Date(freeze.usedAt) : null;
    const diff = lastUsed ? (now - lastUsed) / (1000 * 60 * 60 * 24) : 999;
    if (diff < 7) return;
    setFreeze({ usedAt: now.toISOString() });
  };

  if (loading) return <Spinner text="Loading streak..." />;

  return (
    <div className="space-y-4">
      <div className="card p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-gold-400 animate-pulse">
          <Flame size={34} />
          <span className="text-5xl font-mono">{streak.streakCount}</span>
        </div>
        <p className="text-white/70 mt-2">Best streak: {streak.longestStreak}</p>
        <p className="mt-3">{getStreakMessage(streak.streakCount)}</p>
        <div className="flex justify-center gap-2 mt-4">
          <Button onClick={async () => { await api.post("/streak/checkin"); await refresh(); }}>
            Check In Today
          </Button>
          <Button variant="secondary" onClick={useFreeze}>
            Use Streak Freeze
          </Button>
        </div>
        <p className="text-xs text-white/60 mt-2">
          Freeze {freeze.usedAt ? `last used ${new Date(freeze.usedAt).toLocaleDateString()}` : "available"}
        </p>
      </div>

      <div className="card p-4">
        <h3 className="mb-2">Milestones</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {streakMilestones.map((m) => (
            <div
              key={m}
              className={`rounded-xl p-3 text-center ${streak.streakCount >= m ? "bg-emerald-500/20 text-emerald-300" : "bg-navy-700 text-white/70"}`}
            >
              <p className="font-mono">{m}</p>
              <p className="text-xs">{m >= 30 ? "Diamond" : "Fire"}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="mb-3">Last 7 Days Check-in</h3>
        <div className="flex gap-2">
          {last7.map((d) => (
            <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full ${d.minutes > 0 ? "bg-emerald-500" : "bg-navy-700"}`} />
              <span className="text-[10px] text-white/60">{d.key.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
