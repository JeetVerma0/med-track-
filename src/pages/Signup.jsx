import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, UserPlus } from "lucide-react";
import { signup } from "../services/auth";
import { db } from "../services/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export default function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

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
      const user = await signup(form.email, form.password);
      // Create base user doc (Profile page will complete the rest later)
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: form.name.trim(),
          email: form.email.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // As requested: after Sign Up, go to Login (not Profile)
      navigate("/login", { replace: true, state: { email: form.email.trim() } });
    } catch (e2) {
      alert(e2?.message || "Sign up failed");
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

        <h1 className="mb-2 text-3xl font-semibold text-gray-900">Create your account</h1>
        <p className="mb-8 text-center text-sm text-gray-600">
          Sign up now, then log in to start using Med Track.
        </p>

        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <UserPlus className="h-4 w-4" />
            Sign Up
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Name"
              className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-100"
              required
            />
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
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={onChange}
              placeholder="Confirm Password"
              className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-100"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#3b82f6] px-4 text-sm font-medium text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link className="font-medium text-[#3b82f6] hover:underline" to="/login">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

