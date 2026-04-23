import { NavLink } from "react-router-dom";
import { BarChart3, BookOpen, Calendar, CheckSquare, Flame, Goal, House, LogOut, Timer, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

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
  return (
    <div className="min-h-screen md:flex bg-navy-900">
      <aside className="hidden md:flex md:w-64 p-4 border-r border-white/10 flex-col">
        <h1 className="font-display text-3xl text-gold-400 mb-6">StudyPulse</h1>
        <div className="space-y-2">
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-sm flex items-center gap-2 ${
                  isActive ? "bg-gold-400 text-navy-900" : "bg-white/5 hover:bg-white/10"
                }`
              }
              to={to}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </div>
        <button className="btn-secondary mt-auto flex items-center justify-center gap-2" onClick={logout}>
          <LogOut size={14} /> Logout
        </button>
      </aside>
      <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      <nav className="fixed bottom-0 inset-x-0 md:hidden bg-navy-800 border-t border-white/10 px-2 py-2">
        <div className="grid grid-cols-5 gap-1">
          {links.slice(0, 5).map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `py-2 rounded-lg flex flex-col items-center text-[11px] ${isActive ? "text-gold-400" : "text-white/70"}`
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
