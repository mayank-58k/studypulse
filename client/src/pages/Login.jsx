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
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={submit} className="card w-full max-w-md p-6 space-y-4 shadow-[0_0_40px_rgba(0,255,136,.2)]">
        <h1 className="text-4xl font-display text-neon-primary">StudyPulse</h1>
        <p className="text-sm text-white/70">Track grades, study habits, goals, and streaks.</p>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button className="w-full" disabled={loading}>{loading ? "Signing in..." : "Login"}</Button>
        <p className="text-sm text-white/70">
          Need an account? <Link to="/register" className="text-neon-secondary hover:underline">Create account</Link>
        </p>
      </form>
    </div>
  );
}
