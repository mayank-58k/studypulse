import { useState } from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, BookOpen, Calendar, CheckSquare, Flame, Goal, House, Keyboard, LogOut, Timer, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import KeyboardShortcuts from "../ui/KeyboardShortcuts";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";

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
  const [showShortcuts, setShowShortcuts] = useState(false);
  useKeyboardShortcuts(() => setShowShortcuts(true));

  return (
    <div className="min-h-screen md:flex" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0f0a 100%)' }}>
      <aside className="hidden md:flex md:w-64 p-4 border-r border-white/10 flex-col backdrop-blur-xl bg-white/3">
        <h1 className="font-heading text-2xl font-bold mb-6" style={{ color: '#00ff88', textShadow: '0 0 20px rgba(0,255,136,0.5)' }}>
          StudyPulse
        </h1>
        <div className="space-y-1">
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              end={to === "/"}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-xl text-sm flex items-center gap-3 transition-all duration-300 ${
                  isActive
                    ? "bg-neon-primary/10 text-neon-primary border border-neon-primary/30 shadow-[0_0_10px_rgba(0,255,136,0.1)]"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`
              }
              to={to}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>
        <div className="mt-auto space-y-2">
          <button
            className="w-full px-3 py-2 text-xs text-white/40 hover:text-white/70 flex items-center gap-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setShowShortcuts(true)}
          >
            <Keyboard size={12} /> Press ? for shortcuts
          </button>
          <button
            className="w-full btn-secondary flex items-center justify-center gap-2 text-sm"
            onClick={logout}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      <nav className="fixed bottom-0 inset-x-0 md:hidden backdrop-blur-xl bg-navy-800/90 border-t border-white/10 px-2 py-2">
        <div className="flex overflow-x-auto gap-1 no-scrollbar">
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex-shrink-0 py-2 px-3 rounded-lg flex flex-col items-center text-[10px] transition-all duration-300 ${
                  isActive ? "text-neon-primary bg-neon-primary/10" : "text-white/60"
                }`
              }
            >
              <Icon size={16} />
              <span className="mt-0.5">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      <KeyboardShortcuts open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}
