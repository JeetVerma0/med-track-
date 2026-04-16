import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HeartPulse, ArrowLeft, LogIn } from "lucide-react";
import { login } from "../services/auth";
import { getUserProfile, isProfileComplete } from "../services/db";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    const emailFromSignup = location.state?.email;
    if (emailFromSignup) setForm((p) => ({ ...p, email: emailFromSignup }));
  }, [location.state]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      let profile = null;
      try {
        profile = await getUserProfile(user.uid);
      } catch {
        profile = null;
      }
      navigate(isProfileComplete(profile) ? "/dashboard" : "/profile", { replace: true });
    } catch (e2) {
      alert(e2?.message || "Login failed");
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
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-vibrant-blue shadow-lg shadow-brand-500/30 group">
          <HeartPulse className="h-10 w-10 text-white" />
        </div>

        <h1 className="mb-2 text-4xl font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
        <p className="mb-8 text-center font-medium text-slate-600">Access your health timeline.</p>

        <div className="w-full max-w-md glass-card rounded-[2rem] p-8 relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-vibrant-pink/20 blur-[60px] -z-10 rounded-full"></div>
           
          <div className="mb-6 flex items-center gap-2 font-bold text-slate-900 text-lg">
            <LogIn className="h-5 w-5 text-brand-500" />
            Login
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="Email address"
              className="h-14 w-full rounded-2xl bg-white/60 border border-white/50 px-4 font-medium text-slate-900 outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 transition-all placeholder:text-slate-400"
              required
            />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="Password"
              className="h-14 w-full rounded-2xl bg-white/60 border border-white/50 px-4 font-medium text-slate-900 outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 transition-all placeholder:text-slate-400"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="h-14 mt-2 rounded-2xl bg-slate-900 text-white font-bold tracking-wide shadow-xl shadow-slate-900/20 transition hover:bg-slate-800 disabled:opacity-60 disabled:hover:scale-100 hover:scale-[1.02]"
            >
              {loading ? "Authenticating..." : "Login to MedTrack"}
            </button>
          </form>

          <div className="mt-8 text-center font-medium text-slate-600">
            First time here?{" "}
            <Link className="font-bold text-brand-600 hover:text-brand-500 transition-colors" to="/signup">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
