import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";

const initialForm = { title: "", type: "custom", targetValue: 10, deadline: "" };

function ProgressRing({ value, target }) {
  const percent = Math.min(100, Math.round(((value || 0) / (target || 1)) * 100));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={radius} stroke="#252840" strokeWidth="10" fill="none" />
      <circle
        cx="55"
        cy="55"
        r={radius}
        stroke="#f0b429"
        strokeWidth="10"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 55 55)"
      />
      <text x="55" y="60" textAnchor="middle" fontSize="16" fill="white">
        {percent}%
      </text>
    </svg>
  );
}

export default function Goals() {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [badges, setBadges] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    setLoading(true);
    try {
      const [goalsRes, badgesRes] = await Promise.all([api.get("/goals"), api.get("/badges")]);
      setGoals(goalsRes.data);
      setBadges(badgesRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
    toast.success("Goal completed");
    load();
  };

  if (loading) return <Spinner text="Loading goals..." />;

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-center justify-between">
        <h2 className="text-2xl font-display">Goals</h2>
        <Button onClick={() => setShowModal(true)}>Add Goal</Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        {activeGoals.map((goal) => (
          <div className="card p-4 flex gap-4 items-center" key={goal._id}>
            <ProgressRing value={goal.currentValue} target={goal.targetValue} />
            <div className="flex-1">
              <h3 className="text-lg">{goal.title}</h3>
              <p className="text-sm text-white/70">
                {goal.currentValue}/{goal.targetValue} - {goal.type}
              </p>
              <p className="text-xs text-white/60">Deadline: {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "None"}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" onClick={() => updateProgress(goal)}>
                  Update Progress
                </Button>
                <Button onClick={() => markComplete(goal)}>Mark Complete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h3 className="text-lg mb-2">Completed Goals</h3>
        <div className="space-y-2">
          {completedGoals.length ? (
            completedGoals.map((goal) => (
              <div key={goal._id} className="bg-navy-700 rounded-lg p-3">
                {goal.title} - completed
              </div>
            ))
          ) : (
            <p className="text-sm text-white/60">No completed goals yet.</p>
          )}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-lg mb-2">Badge Grid</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {badges.length ? (
            badges.map((badge) => (
              <div key={badge._id} className="rounded-lg bg-navy-700 p-3">
                <p>{badge.title}</p>
                <p className="text-xs text-white/60">{badge.type}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/60">Badges will unlock as you progress.</p>
          )}
        </div>
      </div>

      <Modal open={showModal} title="Create Goal" onClose={() => setShowModal(false)}>
        <form onSubmit={addGoal} className="space-y-3">
          <Input label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <label className="block space-y-1">
            <span className="text-sm text-white/70">Type</span>
            <select className="input" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              {["gpa", "study_hours", "assignments", "streak", "custom"].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <Input
            label="Target value"
            type="number"
            value={form.targetValue}
            onChange={(e) => setForm((p) => ({ ...p, targetValue: e.target.value }))}
          />
          <Input label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} />
          <Button className="w-full">Create Goal</Button>
        </form>
      </Modal>
    </div>
  );
}
