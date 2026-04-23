import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import useTimer from "../hooks/useTimer";

const modes = {
  work: 25 * 60,
  short: 5 * 60,
  long: 15 * 60
};

export default function Timer() {
  const [mode, setMode] = useState("work");
  const { seconds, running, setRunning, reset } = useTimer(modes.work);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cycle, setCycle] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const [subjectRes, sessionRes] = await Promise.all([api.get("/subjects"), api.get("/sessions")]);
      setSubjects(subjectRes.data);
      setSubjectId(subjectRes.data[0]?._id || "");
      const today = new Date().toDateString();
      setHistory(sessionRes.data.filter((s) => new Date(s.date).toDateString() === today));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    reset(modes[mode]);
  }, [mode]);

  useEffect(() => {
    if (seconds > 0 || !running) return;
    (async () => {
      if (soundEnabled) new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play();
      if (mode === "work" && subjectId) {
        await api.post("/sessions", { subject: subjectId, duration: 25, type: "pomodoro" });
        await api.post("/badges/check");
        setCycle((c) => c + 1);
      }
      setRunning(false);
      setMode((prev) => {
        if (prev === "work") return cycle % 4 === 3 ? "long" : "short";
        return "work";
      });
      load();
      toast.success("Session complete");
    })();
  }, [seconds, running, mode, subjectId, soundEnabled, cycle, setRunning]);

  const display = useMemo(() => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`, [seconds]);
  const weeklyPomodoros = history.filter((h) => h.type === "pomodoro").length;

  if (loading) return <Spinner text="Loading timer..." />;

  return (
    <div className="space-y-4">
      <div className="card p-4 flex gap-2">
        {Object.keys(modes).map((m) => (
          <Button key={m} variant={mode === m ? "primary" : "secondary"} onClick={() => setMode(m)}>
            {m === "work" ? "Work" : m === "short" ? "Short Break" : "Long Break"}
          </Button>
        ))}
      </div>

      <div className="card p-8 text-center">
        <div className="mx-auto mb-4 w-64 h-64 rounded-full border-8 border-gold-400/30 flex items-center justify-center">
          <span className="text-6xl font-mono text-gold-400">{display}</span>
        </div>
        <div className="flex justify-center gap-2">
          <Button onClick={() => setRunning(true)}>Start</Button>
          <Button variant="secondary" onClick={() => setRunning(false)}>
            Pause
          </Button>
          <Button variant="secondary" onClick={() => reset(modes[mode])}>
            Reset
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="card p-4 space-y-3">
          <h3 className="text-lg">Session Setup</h3>
          <label className="block space-y-1">
            <span className="text-sm text-white/70">Subject</span>
            <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />
            Sound notification
          </label>
          <p className="text-sm text-white/70">Weekly pomodoros: {weeklyPomodoros}</p>
        </div>
        <div className="card p-4">
          <h3 className="text-lg mb-2">Today Session Log</h3>
          <div className="space-y-2 max-h-64 overflow-auto">
            {history.length ? (
              history.map((item) => (
                <div key={item._id} className="bg-navy-700 rounded-lg p-2 text-sm">
                  {item.duration} min - {item.type}
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">No sessions yet today.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
