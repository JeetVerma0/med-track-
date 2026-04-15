import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, LogIn } from "lucide-react";
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
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-sky-50">
      <div className="px-6 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white/60"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="flex flex-col items-center px-4 pt-8 pb-12">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22c55e] to-[#3b82f6] shadow-md">
          <Heart className="h-10 w-10 text-white" />
        </div>

        <h1 className="mb-2 text-3xl font-semibold text-gray-900">Welcome back</h1>
        <p className="mb-8 text-center text-sm text-gray-600">Log in to continue.</p>

        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <LogIn className="h-4 w-4" />
            Login
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="Email"
              className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-100"
              required
            />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="Password"
              className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-100"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#3b82f6] px-4 text-sm font-medium text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
            >
              {loading ? "Processing..." : "Login"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-600">
            New to Med Track?{" "}
            <Link className="font-medium text-[#3b82f6] hover:underline" to="/signup">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

