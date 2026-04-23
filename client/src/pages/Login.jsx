import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Login() {
  const [email, setEmail] = useState("demo@studypulse.dev");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
      toast.success("Logged in successfully");
      nav("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0f0a 100%)' }}>
      <form onSubmit={submit} className="w-full max-w-md p-8 space-y-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold" style={{ color: '#00ff88', textShadow: '0 0 30px rgba(0,255,136,0.5)' }}>
            StudyPulse
          </h1>
          <p className="text-sm text-white/60 mt-2">Track grades, study habits, goals, and streaks.</p>
        </div>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </Button>
        <p className="text-sm text-white/60 text-center">
          Need an account?{" "}
          <Link to="/register" className="text-neon-primary hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}
