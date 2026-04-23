import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api from "../api/axios";
import SkeletonLoader from "../components/ui/SkeletonLoader";
import LeaderboardSection from "../components/ui/LeaderboardSection";
import { calcWeightedAverage } from "../utils/gpaCalculator";
import { calcPersonalBests } from "../utils/leaderboardHelpers";

const colors = ["#00ff88", "#00d4ff", "#ff6b35", "#f472b6", "#f97316", "#a78bfa"];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [subRes, gradeRes, sessionsRes] = await Promise.all([api.get("/subjects"), api.get("/grades"), api.get("/sessions")]);
        setSubjects(subRes.data);
        setGrades(gradeRes.data);
        setSessions(sessionsRes.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const performanceData = useMemo(
    () =>
      subjects.map((subject) => {
        const subjectGrades = grades.filter((g) => (g.subject?._id || g.subject) === subject._id);
        return { name: subject.name, average: calcWeightedAverage(subjectGrades) };
      }),
    [subjects, grades]
  );

  const studyPerSubject = useMemo(
    () =>
      subjects.map((subject) => ({
        name: subject.name,
        minutes: sessions.filter((s) => (s.subject?._id || s.subject) === subject._id).reduce((sum, s) => sum + s.duration, 0)
      })),
    [subjects, sessions]
  );

  const gradeTrend = useMemo(
    () =>
      grades
        .map((grade) => ({ date: new Date(grade.date).toISOString().slice(0, 10), score: Number(((grade.score / grade.maxScore) * 100).toFixed(2)) }))
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [grades]
  );

  const weeklyHours = useMemo(() => {
    const map = {};
    for (let i = 7; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      const key = d.toISOString().slice(0, 10);
      map[key] = 0;
    }
    sessions.forEach((session) => {
      const d = new Date(session.date);
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      const key = monday.toISOString().slice(0, 10);
      if (map[key] !== undefined) map[key] += session.duration / 60;
    });
    return Object.entries(map).map(([week, hours]) => ({ week, hours: Number(hours.toFixed(1)) }));
  }, [sessions]);

  const maxWeeklyHours = Math.max(...weeklyHours.map(w => w.hours), 0);

  const scatterData = useMemo(
    () =>
      performanceData.map((perf) => ({
        subject: perf.name,
        gpa: perf.average,
        hours: Number(((studyPerSubject.find((s) => s.name === perf.name)?.minutes || 0) / 60).toFixed(1))
      })),
    [performanceData, studyPerSubject]
  );

  const sortedPerformance = [...performanceData].sort((a, b) => b.average - a.average);
  const best = sortedPerformance[0];
  const worst = sortedPerformance[sortedPerformance.length - 1];
  const records = calcPersonalBests(sessions);

  if (loading) return <div className="space-y-4"><SkeletonLoader height="h-24" /><SkeletonLoader height="h-72" count={2} /></div>;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-2xl font-heading font-bold">Analytics</h2>
        <p className="text-sm text-white/70">Semester summary and trend insights</p>
      </div>

      {/* Personal Records */}
      <LeaderboardSection records={records} />

      <div className="grid lg:grid-cols-2 gap-3">
        <div className="card p-4 h-72">
          <h3 className="mb-2">Subject Performance</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
              <XAxis dataKey="name" tick={{ fill: '#ffffff60', fontSize: 11 }} />
              <YAxis tick={{ fill: '#ffffff60', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="average" fill="#00ff88" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-4 h-72">
          <h3 className="mb-2">Study Time per Subject</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={studyPerSubject} dataKey="minutes" nameKey="name" outerRadius={90}>
                {studyPerSubject.map((entry, i) => (
                  <Cell key={entry.name} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        <div className="card p-4 h-72">
          <h3 className="mb-2">Grade Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gradeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 100]} tick={{ fill: '#ffffff60', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Line dataKey="score" stroke="#00ff88" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-4 h-72">
          <h3 className="mb-2">Study Hours vs GPA</h3>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
              <XAxis dataKey="hours" name="Hours" tick={{ fill: '#ffffff60', fontSize: 11 }} />
              <YAxis dataKey="gpa" name="Average" tick={{ fill: '#ffffff60', fontSize: 11 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Scatter data={scatterData} fill="#00d4ff" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-3">
        <div className="card p-4 lg:col-span-2 h-72">
          <h3 className="mb-2">Weekly Study Hours (Last 8 Weeks)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
              <XAxis dataKey="week" hide />
              <YAxis tick={{ fill: '#ffffff60', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {weeklyHours.map((entry, i) => (
                  <Cell key={i} fill={entry.hours === maxWeeklyHours && entry.hours > 0 ? '#00ff88' : '#252840'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-4">
          <h3 className="mb-2">Best / Worst Subject</h3>
          <div className="space-y-3">
            <div className="bg-neon-primary/10 rounded-xl p-3 border border-neon-primary/20">
              <p className="text-sm text-neon-primary">Best</p>
              <p>{best?.name || "N/A"}</p>
              <p className="text-xs text-white/60">{best?.average?.toFixed?.(2) ?? 0}%</p>
            </div>
            <div className="bg-neon-warning/10 rounded-xl p-3 border border-neon-warning/20">
              <p className="text-sm text-neon-warning">Needs Improvement</p>
              <p>{worst?.name || "N/A"}</p>
              <p className="text-xs text-white/60">{worst?.average?.toFixed?.(2) ?? 0}%</p>
            </div>
            <p className="text-xs text-white/60">Subjects: {subjects.length} | Sessions: {sessions.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
