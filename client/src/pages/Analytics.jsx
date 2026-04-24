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

const colors = ["#00d4ff", "#00ff88", "#60a5fa", "#f472b6", "#f97316", "#a78bfa"];

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

  const bestDay = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      const key = new Date(s.date).toISOString().slice(0, 10);
      map[key] = (map[key] || 0) + s.duration / 60;
    });
    const rows = Object.entries(map).map(([date, hours]) => ({ date, hours: Number(hours.toFixed(1)) }));
    return rows.sort((a, b) => b.hours - a.hours).slice(0, 5);
  }, [sessions]);

  const longestSession = useMemo(() => Math.max(0, ...sessions.map((s) => s.duration / 60)), [sessions]);
  const bestDayHours = bestDay[0]?.hours || 0;
  const bestWeekHours = Math.max(0, ...weeklyHours.map((w) => w.hours));
  const currentWeek = weeklyHours[weeklyHours.length - 1]?.hours || 0;
  const previousWeek = weeklyHours[weeklyHours.length - 2]?.hours || 0;
  const comparison = previousWeek > 0 ? Math.round(((currentWeek - previousWeek) / previousWeek) * 100) : 100;

  const scatterData = useMemo(
    () =>
      performanceData.map((perf) => ({
        subject: perf.name,
        gpa: perf.average,
        hours: Number(((studyPerSubject.find((s) => s.name === perf.name)?.minutes || 0) / 60).toFixed(1))
      })),
    [performanceData, studyPerSubject]
  );

  if (loading) return <Spinner text="Loading analytics..." />;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-2xl font-display">Study Hours Leaderboard</h2>
        <p className="text-sm text-white/70">
          You studied {currentWeek.toFixed(1)} hours this week — that&apos;s {comparison}% {comparison >= 0 ? "more" : "less"} than last week.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-3">
        <div className="card p-4 lg:col-span-2">
          <h3 className="mb-2 font-heading">Top Study Hours Days</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {bestDay.map((day, i) => (
              <div key={day.date} className={`rounded-xl p-3 border ${i === 0 ? "border-neon-primary bg-neon-primary/10" : "border-white/10 bg-white/5"}`}>
                <p>{day.date}</p>
                <p className="text-neon-primary font-mono">{day.hours}h</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4 space-y-3">
          <h3 className="font-heading">Personal Bests</h3>
          <p className="text-sm">Longest session: <span className="text-neon-primary">{longestSession.toFixed(1)}h</span></p>
          <p className="text-sm">Most in one day: <span className="text-neon-secondary">{bestDayHours.toFixed(1)}h</span></p>
          <p className="text-sm">Most in one week: <span className="text-neon-primary">{bestWeekHours.toFixed(1)}h</span></p>
        </div>
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
              <Bar dataKey="average" fill="#00d4ff" />
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
              <Line dataKey="score" stroke="#00ff88" strokeWidth={2} />
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

      <div className="card p-4 h-72">
        <h3 className="mb-2">Weekly Study Hours (Last 8 Weeks)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyHours}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
            <XAxis dataKey="week" hide />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
              {weeklyHours.map((entry) => (
                <Cell key={entry.week} fill={entry.hours === bestWeekHours ? "#00ff88" : "#8b5cf6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
