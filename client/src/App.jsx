import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import Assignments from "./pages/Assignments";
import CalendarPage from "./pages/Calendar";
import Streak from "./pages/Streak";
import Timer from "./pages/Timer";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";

function AnimatedPage({ children }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.22 }}>
      {children}
    </motion.div>
  );
}

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen p-5"><div className="card p-6 animate-pulse h-40" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
        <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
        <Route path="/" element={<Protected><AnimatedPage><Dashboard /></AnimatedPage></Protected>} />
        <Route path="/subjects" element={<Protected><AnimatedPage><Subjects /></AnimatedPage></Protected>} />
        <Route path="/assignments" element={<Protected><AnimatedPage><Assignments /></AnimatedPage></Protected>} />
        <Route path="/calendar" element={<Protected><AnimatedPage><CalendarPage /></AnimatedPage></Protected>} />
        <Route path="/streak" element={<Protected><AnimatedPage><Streak /></AnimatedPage></Protected>} />
        <Route path="/timer" element={<Protected><AnimatedPage><Timer /></AnimatedPage></Protected>} />
        <Route path="/goals" element={<Protected><AnimatedPage><Goals /></AnimatedPage></Protected>} />
        <Route path="/analytics" element={<Protected><AnimatedPage><Analytics /></AnimatedPage></Protected>} />
        <Route path="/profile" element={<Protected><AnimatedPage><Profile /></AnimatedPage></Protected>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}
