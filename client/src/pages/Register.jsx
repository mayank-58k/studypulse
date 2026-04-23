import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || form.password.length < 6) {
      toast.error("Use a valid name/email and password >= 6 chars");
      return;
    }
    try {
      setLoading(true);
      await register(form.name, form.email, form.password);
      toast.success("Account created");
      nav("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0f0a 100%)' }}>
      <form onSubmit={submit} className="w-full max-w-md p-8 space-y-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold" style={{ color: '#00ff88', textShadow: '0 0 30px rgba(0,255,136,0.5)' }}>
            Create Account
          </h1>
          <p className="text-sm text-white/60 mt-2">Join StudyPulse and start tracking your progress.</p>
        </div>
        <Input label="Full name" placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Email" type="email" placeholder="jane@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input
          label="Password"
          type="password"
          placeholder="Minimum 6 characters"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </Button>
        <p className="text-sm text-white/60 text-center">
          Already registered?{" "}
          <Link to="/login" className="text-neon-primary hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
