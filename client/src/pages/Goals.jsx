import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import SkeletonLoader from "../components/ui/SkeletonLoader";
import ProgressRing from "../components/ui/ProgressRing";

const initialForm = { title: "", type: "custom", targetValue: 10, deadline: "", tab: "week" };
const TABS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom" },
];

function GoalCard({ goal, onUpdate, onComplete }) {
  const percent = Math.min(100, Math.round(((goal.currentValue || 0) / (goal.targetValue || 1)) * 100));
  return (
    <div className="card p-4 flex gap-4 items-center hover:-translate-y-1 transition-transform duration-300">
      <ProgressRing value={goal.currentValue} target={goal.targetValue} color="#00ff88" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate">{goal.title}</h3>
        <p className="text-sm text-white/50 mt-0.5">{goal.currentValue}/{goal.targetValue} · {goal.type}</p>
        {goal.deadline && <p className="text-xs text-white/40 mt-0.5">Due {new Date(goal.deadline).toLocaleDateString()}</p>}
        <div className="h-1.5 bg-navy-700 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-neon-primary rounded-full transition-all" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" onClick={() => onUpdate(goal)} className="text-xs py-1 px-3">Update</Button>
          <Button onClick={() => onComplete(goal)} className="text-xs py-1 px-3">Complete ✓</Button>
        </div>
      </div>
    </div>
  );
}

export default function Goals() {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [activeTab, setActiveTab] = useState("week");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/goals");
      setGoals(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addGoal = async (e) => {
    e.preventDefault();
    if (!form.title || Number(form.targetValue) <= 0) return toast.error("Enter valid goal details");
    await api.post("/goals", { ...form, targetValue: Number(form.targetValue), currentValue: 0 });
    toast.success("Goal created! 🎯");
    setForm(initialForm); setShowModal(false); load();
  };

  const updateProgress = async (goal) => {
    const raw = window.prompt("Enter current value", String(goal.currentValue || 0));
    if (raw === null) return;
    const currentValue = Number(raw);
    if (Number.isNaN(currentValue)) return;
    await api.patch(`/goals/${goal._id}/progress`, { currentValue }); load();
  };

  const markComplete = async (goal) => {
    await api.patch(`/goals/${goal._id}/progress`, { currentValue: goal.targetValue, completed: true });
    toast.success("Goal completed! 🏆"); load();
  };

  if (loading) return <div className="space-y-4"><SkeletonLoader height="h-16" /><SkeletonLoader height="h-48" count={2} /></div>;

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  const tabGoals = activeGoals.filter(g => {
    if (activeTab === 'today') return g.type === 'study_hours' || g.deadline?.slice(0, 10) === new Date().toISOString().slice(0, 10);
    if (activeTab === 'week') return g.type !== 'custom' || !g.deadline || true;
    if (activeTab === 'month') return true;
    return g.type === 'custom';
  });

  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">Goals</h2>
        <Button onClick={() => setShowModal(true)}>+ Add Goal</Button>
      </div>

      {/* Tabs */}
      <div className="card p-2 flex gap-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === tab.key
                ? 'bg-neon-primary/10 text-neon-primary border border-neon-primary/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {/* Active goals grid */}
      {tabGoals.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-3">
          {tabGoals.map(goal => (
            <GoalCard key={goal._id} goal={goal} onUpdate={updateProgress} onComplete={markComplete} />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-white/50">No goals for this period. Create one!</p>
          <Button className="mt-4" onClick={() => setShowModal(true)}>Add Goal</Button>
        </div>
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-3">✅ Completed Goals ({completedGoals.length})</h3>
          <div className="space-y-2">
            {completedGoals.map(goal => (
              <div key={goal._id} className="bg-neon-primary/5 border border-neon-primary/10 rounded-xl p-3 flex items-center gap-3">
                <span className="text-neon-primary text-lg">✓</span>
                <div><p className="font-medium text-white/80">{goal.title}</p><p className="text-xs text-white/40">{goal.type}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={showModal} title="Create Goal 🎯" onClose={() => setShowModal(false)}>
        <form onSubmit={addGoal} className="space-y-3">
          <Input label="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <label className="block space-y-1">
            <span className="text-sm text-white/70">Type</span>
            <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {["gpa", "study_hours", "assignments", "streak", "custom"].map(t => <option key={t}>{t}</option>)}
            </select>
          </label>
          <Input label="Target value" type="number" value={form.targetValue} onChange={e => setForm(p => ({ ...p, targetValue: e.target.value }))} />
          <Input label="Deadline" type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
          <Button className="w-full">Create Goal 🎯</Button>
        </form>
      </Modal>
    </div>
  );
}
