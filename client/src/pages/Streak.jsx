import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import useLocalStorage from "../hooks/useLocalStorage";
import useStreak from "../hooks/useStreak";

const milestones = [3, 7, 30, 100];

export default function Streak() {
  const { streak, loading, refresh } = useStreak();
  const [heatmap, setHeatmap] = useState({});
  const [freeze, setFreeze] = useLocalStorage("studypulse_streak_freeze", { usedAt: null, count: 2 });
  const [milestone, setMilestone] = useState(null);

  const loadHeatmap = async () => {
    const { data } = await api.get("/sessions/heatmap");
    setHeatmap(data);
  };

  useEffect(() => {
    loadHeatmap();
  }, []);

  useEffect(() => {
    const hit = milestones.find((m) => streak.streakCount === m);
    if (!hit) return;
    const key = `studypulse_milestone_${hit}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "true");
    setMilestone(hit);
    confetti({ particleCount: 130, spread: 75, origin: { y: 0.65 } });
    const timeout = setTimeout(() => setMilestone(null), 3500);
    return () => clearTimeout(timeout);
  }, [streak.streakCount]);

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

  const todayKey = new Date().toISOString().slice(0, 10);
  const atRisk = (heatmap[todayKey] || 0) <= 0;

  const useFreeze = async () => {
    if (!freeze.count) return;
    setFreeze({ ...freeze, count: Math.max(0, freeze.count - 1), usedAt: new Date().toISOString() });
  };

  if (loading) return <Spinner text="Loading streak..." />;

  return (
    <div className="space-y-4">
      <div className="card p-6 text-center relative overflow-hidden">
        <div className="flex items-center justify-center gap-3">
          <span className="text-6xl animate-flicker">🔥</span>
          <span className="text-6xl font-mono text-neon-primary">{streak.streakCount}</span>
        </div>
        <p className="text-white/80 mt-1 text-lg font-heading">{streak.streakCount} days with StudyPulse!</p>

        {atRisk ? (
          <p className="mt-3 text-sm text-rose-300 inline-block px-3 py-1 rounded-full border border-rose-400/30 animate-pulseWarning">
            ⚠️ Study today to keep your streak!
          </p>
        ) : null}

        <div className="grid sm:grid-cols-3 gap-2 mt-5 text-left">
          <div className="bg-navy-700/70 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-white/60">Current Streak</p>
            <p className="text-xl font-mono text-neon-primary">{streak.streakCount}</p>
          </div>
          <div className="bg-navy-700/70 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-white/60">Best Streak</p>
            <p className="text-xl font-mono text-neon-secondary">{streak.longestStreak}</p>
          </div>
          <div className="bg-navy-700/70 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-white/60">Last Active</p>
            <p className="text-sm">{streak.lastActiveDate ? new Date(streak.lastActiveDate).toLocaleDateString() : "Never"}</p>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          <Button
            onClick={async () => {
              await api.post("/streak/checkin");
              await refresh();
              await loadHeatmap();
            }}
          >
            Check In Today
          </Button>
          <Button variant="secondary" onClick={useFreeze}>
            Use Streak Freeze
          </Button>
        </div>

        <p className="text-xs text-white/70 mt-2">🧊 Freeze: {freeze.count} left {freeze.usedAt ? `• last used ${new Date(freeze.usedAt).toLocaleDateString()}` : ""}</p>
      </div>

      <div className="card p-4">
        <h3 className="mb-3 font-heading">This Week Check-in</h3>
        <div className="flex gap-2">
          {last7.map((d) => (
            <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full border border-white/10 ${d.minutes > 0 ? "bg-neon-primary/70 shadow-[0_0_18px_rgba(0,255,136,.45)]" : "bg-navy-700"}`} />
              <span className="text-[10px] text-white/60">{d.key.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      {milestone ? (
        <div className="card p-4 border-neon-primary/50 text-center animate-glow">
          <p className="text-neon-primary font-heading text-lg">{milestone}🔥 Milestone unlocked!</p>
        </div>
      ) : null}
    </div>
  );
}
