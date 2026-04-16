import { Plus, Activity, Calendar, ChevronRight, Bell, HeartPulse, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  getActiveEpisodes,
  getCompletedEpisodes,
  getEpisodeEntries,
} from "../services/db";
import { getUserProfile } from "../services/db";
import { computeCurrentMedicines } from "../utils/episodeState";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [activeOriginal, setActiveOriginal] = useState(null);
  const [latestContinuation, setLatestContinuation] = useState(null);
  const [activeEntries, setActiveEntries] = useState([]);
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!user) return;
      setLoading(true);
      setError("");
      try {
        const [a, c, p] = await Promise.all([
          getActiveEpisodes(user.uid),
          getCompletedEpisodes(user.uid),
          getUserProfile(user.uid),
        ]);

        if (!alive) return;
        setActive(a);
        setCompleted(c);
        setProfileName(p?.name || user.displayName || "");

        if (a?.[0]) {
          const entries = await getEpisodeEntries(user.uid, a[0].id);
          if (!alive) return;
          const originalEntry = entries.find((e) => e.type === "original") || null;
          const updates = entries.filter((e) => e.type === "update");
          const latestUpdate = updates.length ? updates[updates.length - 1] : null;
          setActiveOriginal(originalEntry);
          setLatestContinuation(latestUpdate);
          setActiveEntries(entries);
        } else {
          setActiveOriginal(null);
          setLatestContinuation(null);
          setActiveEntries([]);
        }
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load dashboard data");
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => { alive = false; };
  }, [user]);

  const reminderMeds = useMemo(() => {
    const meds = computeCurrentMedicines(activeEntries);
    const normalized = (meds || [])
      .map((m) => (typeof m === "string" ? { name: m } : m))
      .filter((m) => m?.name);

    return normalized.slice(0, 6);
  }, [activeEntries]);

  const allEpisodes = [...active, ...completed];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen relative backdrop-blur-3xl">
      
      {/* Floating Sidebar Navigation (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 p-6 shrink-0 relative z-10 border-r border-white/20 glass-panel">
         <div className="flex items-center gap-3 mb-12 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-vibrant-blue flex items-center justify-center shadow-lg shadow-brand-500/30">
               <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">MedTrack</span>
         </div>
         <nav className="flex-1 space-y-3 px-2 text-sm font-semibold">
           <button className="w-full flex items-center gap-3 px-4 py-3 bg-white text-brand-600 rounded-xl shadow-soft">
             <Activity className="w-5 h-5" /> Dashboard
           </button>
           <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all">
             <Clock className="w-5 h-5" /> Profile
           </button>
         </nav>
      </aside>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Sleek Modern Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Hello{profileName ? `, ${profileName}` : ""}
            </h1>
            <p className="text-slate-500 font-medium mt-1 text-lg">Your health at a glance.</p>
          </div>
          <button
            onClick={() => navigate("/episodes/new")}
            className="mt-6 sm:mt-0 bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-full shadow-xl shadow-slate-900/20 transition-all flex items-center gap-2 font-bold text-sm"
          >
            <Plus className="h-5 w-5" />
            Create Episode
          </button>
        </div>

        {error && (
          <div className="glass-card rounded-2xl p-6 mb-8 border-red-200 bg-red-50/50 text-red-600 font-semibold">
            <p>{error}</p>
          </div>
        )}

        {/* Bento Grid Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12">
          
          {/* Main Hero Card (Status) - Spans 8 cols */}
          <div className="lg:col-span-8 glass-card rounded-[2rem] p-1 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-400 via-brand-500 to-vibrant-blue opacity-90 blur-sm mix-blend-overlay"></div>
            <div className="relative h-full bg-white/70 backdrop-blur-2xl rounded-[1.8rem] p-8 flex flex-col sm:flex-row items-center gap-8 shadow-inner">
              <div className="flex-1 w-full text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-100/50 rounded-full text-brand-700 font-bold text-xs uppercase tracking-wider mb-4 border border-brand-200">
                  <Activity className="w-3 h-3" /> Current Focus
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Today's Protocol</h2>
                <p className="text-slate-600 font-medium mb-8">Maintain your streaks and keep your logs up to date.</p>
                {active?.[0] ? (
                  <button
                    onClick={() => navigate(`/episodes/${active[0].id}`)}
                    className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 hover:scale-105 transition-all text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
                  >
                    Open Active Episode <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/episodes/new")}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 hover:scale-105 transition-all text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-slate-900/30 flex items-center justify-center gap-2"
                  >
                    Start Tracking Now <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="w-32 h-32 shrink-0 bg-gradient-to-br from-vibrant-purple to-vibrant-pink rounded-full blur-2xl opacity-50 absolute -right-10 -top-10 group-hover:scale-150 transition-transform duration-700"></div>
            </div>
          </div>

          {/* Medicine Reminders Side Panel - Spans 4 cols */}
          <div className="lg:col-span-4 glass-card rounded-[2rem] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 blur-[80px] -z-10 rounded-full"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="font-extrabold text-slate-900 flex items-center gap-2 text-xl">
                <Bell className="h-6 w-6 text-vibrant-orange" />
                Medications
              </div>
            </div>
            {reminderMeds.length > 0 ? (
              <div className="space-y-3">
                {reminderMeds.map((med, i) => (
                  <div key={i} className="bg-white/60 hover:bg-white rounded-2xl px-5 py-4 flex flex-col justify-center border border-white transition-colors duration-200">
                    <span className="font-bold text-slate-800 tracking-tight">{med.name}</span>
                    <span className="text-slate-500 text-xs font-semibold">{med.duration || "Ongoing"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center mt-8 p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-semibold mb-1">No upcoming meds</p>
                <p className="text-slate-400/70 text-xs">You're all clear.</p>
              </div>
            )}
          </div>
        </div>

        {/* Health Feed Section */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900">Health History</h2>
          <span className="px-3 py-1 bg-white/50 rounded-full text-slate-500 font-bold text-sm border border-white">{allEpisodes.length} Episodes</span>
        </div>

        {allEpisodes.length === 0 ? (
           <div className="glass-card rounded-[2rem] py-24 text-center">
             <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mb-8 shadow-inner shadow-white">
               <HeartPulse className="h-10 w-10 text-slate-300" />
             </div>
             <h3 className="text-slate-500 font-extrabold text-2xl mb-3">Your log is empty</h3>
             <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10">
               Begin your journey by creating a health episode. Track symptoms, doctors, and medications effortlessly.
             </p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEpisodes.map((episode) => {
              const isActive = active.some((a) => a.id === episode.id);
              return (
                <div
                  key={episode.id}
                  onClick={() => navigate(`/episodes/${episode.id}`)}
                  className="glass-card rounded-3xl p-6 cursor-pointer group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${isActive ? 'bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20' : 'bg-slate-200/50'}`}>
                        <Activity className={`h-6 w-6 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-lg group-hover:text-brand-600 transition-colors">
                          Health Record
                        </div>
                        <div className="flex items-center text-xs font-semibold text-slate-400 gap-1.5 mt-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {episode.createdAt?.toDate?.().toLocaleDateString() || "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 text-sm font-medium text-slate-500 line-clamp-3 mb-6 bg-white/40 p-4 rounded-2xl border border-white">
                    {episode.notes || "No additional notes provided for this episode."}
                  </div>

                  <div className="flex justify-between items-center mt-auto pt-2">
                     <div
                      className={`px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${isActive
                        ? "bg-brand-100/50 text-brand-700 border border-brand-200"
                        : "bg-slate-200/50 text-slate-500 border border-slate-300/50"
                        }`}
                     >
                      {isActive ? "Tracking" : "Resolved"}
                     </div>
                    <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}