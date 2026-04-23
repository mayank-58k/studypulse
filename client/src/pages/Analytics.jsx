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
import Spinner from "../components/ui/Spinner";
import { calcWeightedAverage } from "../utils/gpaCalculator";

const colors = ["#f0b429", "#10b981", "#60a5fa", "#f472b6", "#f97316", "#a78bfa"];

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

  if (loading) return <Spinner text="Loading analytics..." />;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-2xl font-display">Analytics</h2>
        <p className="text-sm text-white/70">Semester summary and trend insights</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        <div className="card p-4 h-72">
          <h3 className="mb-2">Subject Performance</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="average" fill="#f0b429" />
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
              <Tooltip />
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
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line dataKey="score" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-4 h-72">
          <h3 className="mb-2">Study Hours vs GPA</h3>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
              <XAxis dataKey="hours" name="Hours" />
              <YAxis dataKey="gpa" name="Average" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={scatterData} fill="#60a5fa" />
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
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#a78bfa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-4">
          <h3 className="mb-2">Best / Worst Subject</h3>
          <div className="space-y-3">
            <div className="bg-emerald-500/20 rounded-xl p-3">
              <p className="text-sm text-emerald-300">Best</p>
              <p>{best?.name || "N/A"}</p>
              <p className="text-xs">{best?.average?.toFixed?.(2) ?? 0}%</p>
            </div>
            <div className="bg-rose-500/20 rounded-xl p-3">
              <p className="text-sm text-rose-300">Needs Improvement</p>
              <p>{worst?.name || "N/A"}</p>
              <p className="text-xs">{worst?.average?.toFixed?.(2) ?? 0}%</p>
            </div>
            <p className="text-xs text-white/60">Subjects: {subjects.length} | Sessions: {sessions.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
