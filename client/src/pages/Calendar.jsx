import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import api from "../api/axios";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import SkeletonLoader from "../components/ui/SkeletonLoader";
import LeetCodeHeatmap from "../components/ui/LeetCodeHeatmap";
import { formatDisplayDate } from "../utils/dateHelpers";

const initialForm = { title: "", subject: "", type: "study", start: "", end: "", color: "#10b981", notes: "" };

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [heatmapData, setHeatmapData] = useState({});
  const [sessions, setSessions] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [eventRes, subjectRes, heatmapRes, sessionsRes] = await Promise.all([
        api.get("/calendar"), api.get("/subjects"), api.get("/sessions/heatmap"), api.get("/sessions")
      ]);
      setSubjects(subjectRes.data);
      setEvents(eventRes.data.map(e => ({ ...e, start: new Date(e.start), end: new Date(e.end) })));
      setHeatmapData(heatmapRes.data || {});
      setSessions(sessionsRes.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const heatmapSessionCounts = useMemo(() => {
    const counts = {};
    Object.entries(heatmapData).forEach(([date, minutes]) => { counts[date] = Math.ceil(minutes / 30); });
    return counts;
  }, [heatmapData]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const hours = sessions.filter(s => s.date?.slice(0, 7) === key).reduce((sum, s) => sum + s.duration, 0) / 60;
      months.push({ month: label, hours: Math.round(hours * 10) / 10, isCurrent: i === 0 });
    }
    return months;
  }, [sessions]);

  const upcoming = [...events].sort((a, b) => new Date(a.start) - new Date(b.start)).filter(e => e.start >= new Date()).slice(0, 7);

  const saveEvent = async (e) => {
    e.preventDefault();
    if (!form.title || !form.start || !form.end) return;
    const payload = { ...form, subject: form.subject || null };
    if (selectedEvent?._id) await api.put(`/calendar/${selectedEvent._id}`, payload);
    else await api.post("/calendar", payload);
    setOpenModal(false); setSelectedEvent(null); setForm(initialForm); load();
  };

  const deleteEvent = async () => {
    if (!selectedEvent?._id) return;
    await api.delete(`/calendar/${selectedEvent._id}`);
    setOpenModal(false); setSelectedEvent(null); setForm(initialForm); load();
  };

  if (loading) return <div className="space-y-4"><SkeletonLoader height="h-16" /><SkeletonLoader height="h-64" /></div>;

  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold">Calendar</h2>
        <Button onClick={() => { setSelectedEvent(null); setForm(initialForm); setOpenModal(true); }}>Add Event</Button>
      </div>

      {/* LeetCode Heatmap */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-4">Study Activity — Last 12 Months</h3>
        <LeetCodeHeatmap data={heatmapSessionCounts} />
      </div>

      {/* Monthly Bar Chart */}
      <div className="card p-4 h-64">
        <h3 className="text-lg font-semibold mb-3">Monthly Study Hours</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff11" />
            <XAxis dataKey="month" tick={{ fill: '#ffffff60', fontSize: 11 }} />
            <YAxis tick={{ fill: '#ffffff60', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
              {monthlyData.map((entry, i) => (
                <Cell key={i} fill={entry.isCurrent ? '#00ff88' : '#252840'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Upcoming Events */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-3">Upcoming Events</h3>
        {upcoming.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
            {upcoming.map(event => (
              <div key={event._id} className="bg-white/5 rounded-xl p-3 border border-white/5 cursor-pointer hover:border-neon-primary/30 transition-colors"
                onClick={() => {
                  setSelectedEvent(event);
                  setForm({
                    title: event.title,
                    subject: event.subject?._id || event.subject || "",
                    type: event.type || "study",
                    start: new Date(event.start).toISOString().slice(0, 16),
                    end: new Date(event.end).toISOString().slice(0, 16),
                    color: event.color || "#10b981",
                    notes: event.notes || ""
                  });
                  setOpenModal(true);
                }}>
                <p className="font-medium text-sm">{event.title}</p>
                <p className="text-xs text-white/50 mt-1">{formatDisplayDate(event.start)}</p>
                <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: (event.color || '#10b981') + '33', color: event.color || '#10b981' }}>{event.type}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-white/50">No upcoming events. Add one! 📅</p>}
      </div>

      <Modal open={openModal} title={selectedEvent ? "Edit Event" : "Add Event"} onClose={() => setOpenModal(false)}>
        <form onSubmit={saveEvent} className="space-y-3">
          <Input label="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <label className="block space-y-1">
            <span className="text-sm text-white/70">Type</span>
            <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {["assignment", "exam", "study", "reminder", "other"].map(t => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-white/70">Subject</span>
            <select className="input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
              <option value="">No subject</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </label>
          <Input label="Start" type="datetime-local" value={form.start} onChange={e => setForm(p => ({ ...p, start: e.target.value }))} />
          <Input label="End" type="datetime-local" value={form.end} onChange={e => setForm(p => ({ ...p, end: e.target.value }))} />
          <Input label="Color" type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} />
          <label className="block space-y-1">
            <span className="text-sm text-white/70">Notes</span>
            <textarea className="input min-h-20" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </label>
          <div className="flex gap-2">
            <Button className="flex-1">{selectedEvent ? "Save changes" : "Create event"}</Button>
            {selectedEvent && <Button type="button" variant="secondary" className="flex-1" onClick={deleteEvent}>Delete</Button>}
          </div>
        </form>
      </Modal>
    </div>
  );
}
