import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BarChart3, BookOpen, Calendar, CheckSquare, Flame, Goal, House, LogOut, Timer, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const links = [
  ["/", "Dashboard", House],
  ["/subjects", "Subjects", BookOpen],
  ["/assignments", "Assignments", CheckSquare],
  ["/calendar", "Calendar", Calendar],
  ["/streak", "Streak", Flame],
  ["/timer", "Timer", Timer],
  ["/goals", "Goals", Goal],
  ["/analytics", "Analytics", BarChart3],
  ["/profile", "Profile", User]
];

export default function Layout({ children }) {
  const { logout } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    const onKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
      const key = e.key.toLowerCase();
      if (key === "n") nav("/assignments");
      if (key === "t") nav("/timer");
      if (key === "g") nav("/goals");
      if (key === "c") nav("/calendar");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nav]);

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden md:flex md:w-72 p-4 flex-col glass border-r border-white/10 m-3 rounded-2xl h-[calc(100vh-24px)] sticky top-3">
        <h1 className="font-display text-3xl text-neon-primary mb-1">StudyPulse</h1>
        <p className="text-xs text-white/60 mb-5">N: Assignment • T: Timer • G: Goals • C: Calendar</p>
        <div className="space-y-2 overflow-auto pr-1">
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-sm flex items-center gap-2 border transition-all duration-200 ${
                  isActive
                    ? "bg-neon-primary/20 border-neon-primary text-neon-primary shadow-[0_0_18px_rgba(0,255,136,.35)]"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-neon-secondary/50"
                }`
              }
              to={to}
            >
              <span className="w-1.5 h-6 rounded-full bg-neon-primary/70" />
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </div>
        <button
          className="btn-secondary mt-auto flex items-center justify-center gap-2"
          onClick={() => {
            logout();
            toast.success("Logged out");
          }}
        >
          <LogOut size={14} /> Logout
        </button>
      </aside>
      <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      <nav className="fixed bottom-3 left-3 right-3 md:hidden glass rounded-2xl border border-white/10 p-2 z-40">
        <div className="grid grid-cols-5 gap-1">
          {links.slice(0, 5).map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `py-2 rounded-xl flex flex-col items-center text-[11px] transition-all ${
                  isActive ? "text-neon-primary bg-neon-primary/15 shadow-[inset_0_0_0_1px_rgba(0,255,136,.55)]" : "text-white/70"
                }`
              }
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
