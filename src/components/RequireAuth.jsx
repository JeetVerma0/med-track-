import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getUserProfile, isProfileComplete } from "../services/db";
import { withTimeout } from "../utils/withTimeout";

export function RequireAuth() {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <Outlet />;
}

export function RequireProfile() {
  const { user, authLoading } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!user) return;
      try {
        const p = await withTimeout(getUserProfile(user.uid), 12000, "Loading profile");
        if (alive) setProfile(p);
      } catch (e) {
        if (alive) setLoadError(e?.message || "Failed to load profile");
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (!authLoading) run();
    return () => {
      alive = false;
    };
  }, [user, authLoading]);

  if (authLoading || loading) return <LoadingScreen message="Loading your account…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (loadError && location.pathname !== "/profile") {
    // If profile fetch failed, still allow user to continue by filling profile page.
    return <Navigate to="/profile" replace />;
  }

  if (!isProfileComplete(profile) && location.pathname !== "/profile") {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}

function LoadingScreen({ message = "Loading…" }) {
  return (
    <main className="min-h-screen bg-[#f9fafb]">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="text-sm font-medium text-gray-700">{message}</div>
          <div className="h-3 w-40 rounded bg-gray-100" />
          <div className="mt-4 h-3 w-64 rounded bg-gray-100" />
          <div className="mt-2 h-3 w-52 rounded bg-gray-100" />
        </div>
      </div>
    </main>
  );
}

