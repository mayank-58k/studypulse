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
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={submit} className="card w-full max-w-md p-6 space-y-4 shadow-[0_0_40px_rgba(0,255,136,.2)]">
        <h1 className="text-4xl font-display text-neon-primary">Create Account</h1>
        <Input label="Full name" placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Email" type="email" placeholder="jane@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Password" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button className="w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
        <p className="text-sm text-white/70">
          Already registered? <Link to="/login" className="text-neon-secondary hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}
