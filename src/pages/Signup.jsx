import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartPulse, ArrowLeft, UserPlus } from "lucide-react";
import { signup } from "../services/auth";

export default function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signup(form.email, form.password);
      navigate("/profile", { replace: true });
    } catch (err) {
      alert(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-6 px-6 relative z-10 backdrop-blur-3xl">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-slate-700 bg-white/40 hover:bg-white/60 transition-colors border border-white"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pb-24">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-vibrant-purple to-vibrant-pink shadow-lg shadow-vibrant-purple/30">
          <HeartPulse className="h-10 w-10 text-white" />
        </div>

        <h1 className="mb-2 text-4xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
        <p className="mb-8 text-center font-medium text-slate-600">Start tracking your health intelligently.</p>

        <div className="w-full max-w-md glass-card rounded-[2rem] p-8 relative">
           <div className="absolute top-0 left-0 w-32 h-32 bg-brand-300/30 blur-[60px] -z-10 rounded-full"></div>
           
          <div className="mb-6 flex items-center gap-2 font-bold text-slate-900 text-lg">
            <UserPlus className="h-5 w-5 text-vibrant-purple" />
            Register
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="Email address"
              className="h-14 w-full rounded-2xl bg-white/60 border border-white/50 px-4 font-medium text-slate-900 outline-none focus:bg-white focus:border-vibrant-purple focus:ring-4 focus:ring-vibrant-purple/20 transition-all placeholder:text-slate-400"
              required
            />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="Password (min 6 characters)"
              className="h-14 w-full rounded-2xl bg-white/60 border border-white/50 px-4 font-medium text-slate-900 outline-none focus:bg-white focus:border-vibrant-purple focus:ring-4 focus:ring-vibrant-purple/20 transition-all placeholder:text-slate-400"
              required
              minLength={6}
            />
             <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={onChange}
              placeholder="Confirm Password"
              className="h-14 w-full rounded-2xl bg-white/60 border border-white/50 px-4 font-medium text-slate-900 outline-none focus:bg-white focus:border-vibrant-purple focus:ring-4 focus:ring-vibrant-purple/20 transition-all placeholder:text-slate-400"
              required
              minLength={6}
            />

            <button
              type="submit"
              disabled={loading}
              className="h-14 mt-4 rounded-2xl bg-gradient-to-r from-vibrant-purple to-indigo-600 text-white font-bold tracking-wide shadow-xl shadow-vibrant-purple/30 transition-all hover:brightness-110 disabled:opacity-60 disabled:hover:scale-100 hover:scale-[1.02]"
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-8 text-center font-medium text-slate-600">
            Already tracking?{" "}
            <Link className="font-bold text-vibrant-purple hover:text-indigo-600 transition-colors" to="/login">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
