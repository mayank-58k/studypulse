import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
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

const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 }
};

const pageTransition = { duration: 0.3 };

const PageWrapper = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
    {children}
  </motion.div>
);

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-neon-primary">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

export default function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/" element={<Protected><PageWrapper><Dashboard /></PageWrapper></Protected>} />
        <Route path="/subjects" element={<Protected><PageWrapper><Subjects /></PageWrapper></Protected>} />
        <Route path="/assignments" element={<Protected><PageWrapper><Assignments /></PageWrapper></Protected>} />
        <Route path="/calendar" element={<Protected><PageWrapper><CalendarPage /></PageWrapper></Protected>} />
        <Route path="/streak" element={<Protected><PageWrapper><Streak /></PageWrapper></Protected>} />
        <Route path="/timer" element={<Protected><PageWrapper><Timer /></PageWrapper></Protected>} />
        <Route path="/goals" element={<Protected><PageWrapper><Goals /></PageWrapper></Protected>} />
        <Route path="/analytics" element={<Protected><PageWrapper><Analytics /></PageWrapper></Protected>} />
        <Route path="/profile" element={<Protected><PageWrapper><Profile /></PageWrapper></Protected>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}
