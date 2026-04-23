import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user, fetchMe, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalHours: 0, assignmentsDone: 0 });
  const [form, setForm] = useState({ name: "", avatar: "", school: "", gradeLevel: "", password: "" });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      avatar: user.avatar || "",
      school: user.school || "",
      gradeLevel: user.gradeLevel || "",
      password: ""
    });
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [sessionsRes, assignmentsRes] = await Promise.all([api.get("/sessions"), api.get("/assignments")]);
      setStats({
        totalHours: Number((sessionsRes.data.reduce((sum, session) => sum + session.duration, 0) / 60).toFixed(1)),
        assignmentsDone: assignmentsRes.data.filter((assignment) => assignment.status === "done").length
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    await api.put("/auth/profile", form);
    await fetchMe();
    toast.success("Profile updated");
  };

  const removeAccount = async () => {
    if (!window.confirm("Delete your account permanently?")) return;
    await api.delete("/auth/profile");
    logout();
    toast.success("Account deleted");
  };

  if (loading) return <Spinner text="Loading profile..." />;

  return (
    <div className="space-y-4">
      <form className="card p-4 space-y-3 max-w-2xl" onSubmit={save}>
        <h2 className="text-2xl font-display">Profile</h2>
        <div className="grid md:grid-cols-2 gap-2">
          <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <Input label="Avatar URL" value={form.avatar} onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))} />
          <Input label="School" value={form.school} onChange={(e) => setForm((p) => ({ ...p, school: e.target.value }))} />
          <Input label="Grade level" value={form.gradeLevel} onChange={(e) => setForm((p) => ({ ...p, gradeLevel: e.target.value }))} />
        </div>
        <Input
          label="Change password"
          type="password"
          placeholder="Leave blank to keep current password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        />
        <Button>Save Profile</Button>
      </form>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="card p-4">
          <p className="text-sm text-white/70">Member since</p>
          <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-white/70">Total Study Hours</p>
          <p className="font-mono text-gold-400 text-2xl">{stats.totalHours}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-white/70">Assignments Done</p>
          <p className="font-mono text-emerald-400 text-2xl">{stats.assignmentsDone}</p>
        </div>
      </div>

      <div className="card p-4 border border-rose-500/30 max-w-2xl">
        <h3 className="text-rose-300 mb-2">Danger Zone</h3>
        <Button variant="secondary" onClick={removeAccount}>
          Delete Account
        </Button>
      </div>
    </div>
  );
}
