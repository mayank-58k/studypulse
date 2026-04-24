import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";

const initialForm = { title: "", type: "today", targetValue: 2, deadline: "" };

const badgeCatalog = [
  "3 Day Streak", "7 Day Streak", "14 Day Streak", "30 Day Streak", "60 Day Streak", "100 Day Streak", "365 Day Streak",
  "Night Owl", "Early Bird", "Marathon", "Century", "Speed Runner", "Clean Slate", "On Fire",
  "Perfect Score", "Comeback Kid", "Consistent", "First Login", "Profile Complete", "Goal Crusher", "Subject Master"
].map((title) => ({ title }));

function ProgressRing({ value, target, size = 110 }) {
  const percent = Math.min(100, Math.round(((value || 0) / (target || 1)) * 100));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={radius} stroke="#1f2b34" strokeWidth="10" fill="none" />
      <circle cx="55" cy="55" r={radius} stroke="#00ff88" strokeWidth="10" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 55 55)" />
      <text x="55" y="60" textAnchor="middle" fontSize="16" fill="white">{percent}%</text>
    </svg>
  );
}

export default function Goals() {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [badges, setBadges] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tab, setTab] = useState("today");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [burstGoal, setBurstGoal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [goalsRes, badgesRes, sessionsRes, assignmentsRes] = await Promise.all([
        api.get("/goals"),
        api.get("/badges"),
        api.get("/sessions"),
        api.get("/assignments")
      ]);
      setGoals(goalsRes.data);
      setBadges(badgesRes.data);
      setSessions(sessionsRes.data);
      setAssignments(assignmentsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const startWeek = new Date(now);
    startWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    startWeek.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(startWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    let todayHours = 0;
    let weekHours = 0;
    let lastWeekHours = 0;

    sessions.forEach((s) => {
      const date = new Date(s.date);
      const key = date.toISOString().slice(0, 10);
      if (key === todayKey) todayHours += s.duration / 60;
      if (date >= startWeek) weekHours += s.duration / 60;
      if (date >= lastWeekStart && date < startWeek) lastWeekHours += s.duration / 60;
    });

    const weekAssignmentsDone = assignments.filter((a) => a.status === "done" && new Date(a.updatedAt || a.createdAt) >= startWeek).length;

    return {
      todayHours: Number(todayHours.toFixed(1)),
      weekHours: Number(weekHours.toFixed(1)),
      lastWeekHours: Number(lastWeekHours.toFixed(1)),
      weekAssignmentsDone
    };
  }, [sessions, assignments]);

  const groupedGoals = useMemo(() => {
    const normalize = (goal) => {
      if (["today", "week", "month"].includes(goal.type)) return goal.type;
      if (["study_hours", "assignments", "streak"].includes(goal.type)) return "week";
      if (["gpa", "custom"].includes(goal.type)) return "month";
      return "month";
    };
    return {
      today: goals.filter((g) => !g.completed && normalize(g) === "today"),
      week: goals.filter((g) => !g.completed && normalize(g) === "week"),
      month: goals.filter((g) => !g.completed && normalize(g) === "month")
    };
  }, [goals]);

  const addGoal = async (e) => {
    e.preventDefault();
    if (!form.title || Number(form.targetValue) <= 0) return toast.error("Enter valid goal details");
    await api.post("/goals", { ...form, targetValue: Number(form.targetValue), currentValue: 0 });
    toast.success("Goal created");
    setForm(initialForm);
    setShowModal(false);
    load();
  };

  const updateProgress = async (goal) => {
    const raw = window.prompt("Enter current value", String(goal.currentValue || 0));
    if (raw === null) return;
    const currentValue = Number(raw);
    if (Number.isNaN(currentValue)) return;
    await api.patch(`/goals/${goal._id}/progress`, { currentValue });
    load();
  };

  const markComplete = async (goal) => {
    await api.patch(`/goals/${goal._id}/progress`, { currentValue: goal.targetValue, completed: true });
    setBurstGoal(goal._id);
    setGoals((prev) => prev.map((g) => (g._id === goal._id ? { ...g, completed: true } : g)));
    setTimeout(() => setBurstGoal(null), 1200);
    toast.success("Goal completed");
  };

  const earnedTitles = useMemo(() => new Set(badges.map((b) => b.title)), [badges]);

  if (loading) return <Spinner text="Loading goals..." />;

  const active = groupedGoals[tab];

  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-center justify-between">
        <h2 className="text-2xl font-display">Goals</h2>
        <Button onClick={() => setShowModal(true)}>Add Goal</Button>
      </div>

      <div className="card p-2 grid grid-cols-3 gap-2">
        {[
          ["today", "Today"],
          ["week", "This Week"],
          ["month", "This Month"]
        ].map(([key, label]) => (
          <button key={key} className={`rounded-xl py-2 text-sm transition ${tab === key ? "bg-neon-primary/20 text-neon-primary border border-neon-primary/45" : "bg-white/5 text-white/80 border border-white/10"}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "today" ? (
        <div className="card p-4 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h3 className="text-lg font-heading">Daily Study Goal</h3>
            <p className="text-sm text-white/60">Logged today: {stats.todayHours}h</p>
          </div>
          <ProgressRing value={stats.todayHours} target={groupedGoals.today[0]?.targetValue || 2} />
        </div>
      ) : null}

      {tab === "week" ? (
        <div className="grid lg:grid-cols-2 gap-3">
          <div className="card p-4">
            <p className="text-sm text-white/60">Weekly study hours</p>
            <div className="h-3 rounded-full bg-white/10 mt-2 overflow-hidden">
              <div className="h-full bg-neon-primary" style={{ width: `${Math.min(100, (stats.weekHours / 12) * 100)}%` }} />
            </div>
            <p className="text-xs mt-1">{stats.weekHours}h this week</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-white/60">Weekly assignments completed</p>
            <div className="h-3 rounded-full bg-white/10 mt-2 overflow-hidden">
              <div className="h-full bg-neon-secondary" style={{ width: `${Math.min(100, (stats.weekAssignmentsDone / 10) * 100)}%` }} />
            </div>
            <p className="text-xs mt-1">{stats.weekAssignmentsDone} done this week</p>
          </div>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-2 gap-3">
        <AnimatePresence>
          {active.map((goal) => (
            <motion.div
              className="card p-4 flex gap-4 items-center"
              key={goal._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
            >
              <ProgressRing value={goal.currentValue} target={goal.targetValue} size={98} />
              <div className="flex-1">
                <h3 className="text-lg font-heading">{goal.title}</h3>
                <p className="text-sm text-white/70">Target: {goal.targetValue} • Current: {goal.currentValue}</p>
                <p className="text-xs text-white/60">Deadline: {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "None"}</p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <Button variant="secondary" onClick={() => updateProgress(goal)}>Update</Button>
                  <Button onClick={() => markComplete(goal)}>Mark Complete</Button>
                </div>
              </div>
              {burstGoal === goal._id ? <div className="text-3xl animate-ping text-neon-primary">✅</div> : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {tab === "month" ? (
        <div className="card p-4">
          <h3 className="text-lg mb-2 font-heading">Badges</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
            {badgeCatalog.map((badge) => {
              const earned = earnedTitles.has(badge.title);
              return (
                <div key={badge.title} className={`rounded-xl p-3 border transition-all ${earned ? "bg-neon-primary/10 border-neon-primary/50 hover:shadow-[0_0_20px_rgba(0,255,136,.3)]" : "bg-white/5 border-white/10 grayscale"}`}>
                  <p className="text-sm">{badge.title}</p>
                  <p className="text-xs text-white/60">{earned ? "Earned" : "Locked"} {earned ? "✨" : "🔒"}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <Modal open={showModal} title="Create Goal" onClose={() => setShowModal(false)}>
        <form onSubmit={addGoal} className="space-y-3">
          <Input label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <label className="block space-y-1">
            <span className="text-sm text-white/70">Goal Type</span>
            <select className="input" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              {["today", "week", "month"].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <Input label="Target value" type="number" value={form.targetValue} onChange={(e) => setForm((p) => ({ ...p, targetValue: e.target.value }))} />
          <Input label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} />
          <Button className="w-full">Create Goal</Button>
        </form>
      </Modal>
    </div>
  );
}
