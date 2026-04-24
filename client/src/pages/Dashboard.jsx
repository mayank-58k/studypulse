import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { CalendarClock } from "lucide-react";
import { formatDisplayDate, humanDueDate } from "../utils/dateHelpers";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning 🌅";
  if (hour < 18) return "Good afternoon 🌤️";
  return "Good evening 🌙";
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    pending: 0,
    weeklyHours: 0,
    streak: 0,
    upcoming: [],
    badges: []
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [assignmentsRes, sessionsRes, streakRes, badgesRes] = await Promise.all([
          api.get("/assignments"),
          api.get("/sessions/weekly"),
          api.get("/streak"),
          api.get("/badges")
        ]);
        const assignments = assignmentsRes.data || [];
        const upcoming = assignments
          .filter((a) => a.status !== "done")
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 5);

        setState({
          pending: assignments.filter((i) => i.status !== "done").length,
          weeklyHours: Number((sessionsRes.data.reduce((acc, i) => acc + i.duration, 0) / 60).toFixed(1)),
          streak: streakRes.data.streakCount || 0,
          upcoming,
          badges: (badgesRes.data || []).slice(-4).reverse()
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const todaysFocus = useMemo(() => {
    if (!state.upcoming.length) return null;
    const highPriority = state.upcoming.find((item) => item.priority === "high");
    return highPriority || state.upcoming[0];
  }, [state.upcoming]);

  if (loading) return <Spinner text="Loading dashboard..." />;

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <p className="text-sm text-white/60">{formatDisplayDate(new Date())}</p>
        <motion.h2 className="text-3xl font-display mt-1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {getGreeting()}
        </motion.h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Today's Focus", todaysFocus ? todaysFocus.title : "No urgent tasks"],
          ["Pending Assignments", state.pending],
          ["Study Hours This Week", state.weeklyHours],
          ["Current Streak", state.streak]
        ].map(([label, value], index) => (
          <motion.div
            key={label}
            className="card p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <p className="text-sm text-white/70">{label}</p>
            <p className="text-2xl text-neon-primary font-mono mt-1">{value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-3">
        <div className="card p-4 lg:col-span-2">
          <h3 className="text-lg mb-3 font-heading">Upcoming Deadlines</h3>
          <div className="space-y-2">
            {state.upcoming.length ? (
              state.upcoming.map((item) => (
                <div key={item._id} className="bg-navy-700/70 rounded-xl p-3 flex items-center justify-between border border-white/10 interactive">
                  <div>
                    <p>{item.title}</p>
                    <p className="text-xs text-white/60">{item.subject?.name || "No subject"}</p>
                  </div>
                  <p className="text-sm text-neon-secondary">{humanDueDate(item.dueDate)}</p>
                </div>
              ))
            ) : (
              <EmptyState icon={CalendarClock} title="Nothing pending" message="You’re clear for now. Add a new assignment to keep momentum." />
            )}
          </div>
        </div>
        <div className="card p-4">
          <h3 className="text-lg mb-3 font-heading">Recent Badges</h3>
          <div className="space-y-2">
            {state.badges.length ? (
              state.badges.map((badge) => (
                <div key={badge._id} className="bg-navy-700/70 rounded-lg p-3 border border-white/10">
                  <p>{badge.title}</p>
                  <p className="text-xs text-white/60">{badge.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">No badges yet. Keep studying.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
