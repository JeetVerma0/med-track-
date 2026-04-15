import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Stethoscope, History, Bell, UserRound, Activity } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
  getActiveEpisodes,
  getCompletedEpisodes,
  getEpisodeEntries,
} from "../services/db";
import { Button, Card, Container, SectionTitle } from "../components/Ui";
import { EpisodeCard } from "../components/EpisodeCard";
import { getUserProfile } from "../services/db";
import { computeCurrentMedicines } from "../utils/episodeState";
import { Navbar } from "../components/layout/Navbar";

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
    return () => {
      alive = false;
    };
  }, [user]);

  const reminderMeds = useMemo(() => {
    const meds = computeCurrentMedicines(activeEntries);
    const normalized = (meds || [])
      .map((m) => {
        if (!m) return null;
        if (typeof m === "string") return { name: m };
        return { name: m.name, duration: m.duration };
      })
      .filter((m) => m?.name);

    return normalized.slice(0, 6);
  }, [activeEntries]);

  return (
    <main className="min-h-screen bg-transparent">
      <Container>
        <Navbar
          title="Med Track"
          subtitle={profileName ? `Welcome back, ${profileName}.` : "Welcome back."}
          right={
            <button
              onClick={() => navigate("/profile")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
              aria-label="Open profile"
            >
              <UserRound className="h-5 w-5 text-gray-700" />
            </button>
          }
        />

        <div className="grid gap-6 pb-12">
          {error ? (
            <Card className="p-4">
              <div className="text-sm font-medium text-gray-900">Couldn’t load data</div>
              <div className="mt-1 text-sm text-gray-600">{error}</div>
              <div className="mt-3">
                <Button variant="secondary" onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              </div>
            </Card>
          ) : null}

          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-sky-50 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Today</div>
                  <div className="mt-1 text-sm text-gray-700">
                    Track symptoms, medicines, and doctor visits in one place.
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 ring-1 ring-white">
                  <Activity className="h-5 w-5 text-emerald-700" />
                </div>
              </div>
              <div className="mt-4">
                {active?.[0] ? (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button onClick={() => navigate(`/episodes/${active[0].id}`)}>
                      Continue current episode
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        alert(
                          "You already have an active episode. Please continue it, or mark it as cured before starting a new one."
                        );
                      }}
                    >
                      <Plus className="h-4 w-4" /> Add new (disabled)
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => navigate("/episodes/new")}>
                    <Plus className="h-4 w-4" /> Add Health Episode
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle
              icon={<Stethoscope className="h-5 w-5" />}
              title="Current Health Episode"
              subtitle="See both the original entry and latest continuation."
            />

            <div className="mt-5">
              {loading ? (
                <div className="h-12 rounded-xl bg-gray-100" />
              ) : active?.[0] ? (
                <button onClick={() => navigate(`/episodes/${active[0].id}`)} className="w-full text-left">
                  <Card className="p-4 transition hover:shadow-md">
                    <div className="text-sm font-semibold text-gray-900">Active episode overview</div>
                    <div className="mt-1 text-sm text-gray-600">
                      Started on {active[0].createdAt?.toDate?.().toLocaleDateString?.() || "—"}
                    </div>

                    <div className="mt-4 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200">
                      <div className="text-xs font-medium text-gray-600">Original entry</div>
                      <div className="mt-1 text-sm text-gray-800">
                        {(activeOriginal?.symptoms || []).length
                          ? activeOriginal.symptoms.join(", ")
                          : "No symptoms listed"}
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200">
                      <div className="text-xs font-medium text-gray-600">Latest continuation</div>
                      {latestContinuation ? (
                        <div className="mt-1 grid gap-1 text-sm text-gray-800">
                          <div>
                            <span className="font-medium text-gray-700">Symptoms added:</span>{" "}
                            {(latestContinuation.symptomsAdded || []).length
                              ? latestContinuation.symptomsAdded.join(", ")
                              : "—"}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Symptoms resolved:</span>{" "}
                            {(latestContinuation.symptomsResolved || []).length
                              ? latestContinuation.symptomsResolved.join(", ")
                              : "—"}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 text-sm text-gray-700">No continuation update yet.</div>
                      )}
                    </div>
                  </Card>
                </button>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  No active episode right now. When you feel unwell, add one to start tracking.
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle
              icon={<Bell className="h-5 w-5" />}
              title="Medicine Reminders"
              subtitle="A simple list from your active episode."
            />

            <div className="mt-4">
              {!active?.[0] ? (
                <div className="text-sm text-gray-600">No active episode medicines to show.</div>
              ) : reminderMeds.length ? (
                <ul className="grid gap-2">
                  {reminderMeds.map((m, idx) => (
                    <li
                      key={`${m.name}-${idx}`}
                      className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-800 ring-1 ring-gray-200"
                    >
                      <span className="font-medium">{m.name}</span>
                      <span className="text-gray-600">{m.duration || "—"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-600">No medicines added yet.</div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle
              icon={<History className="h-5 w-5" />}
              title="Past Health Episodes"
              subtitle="Completed episodes are kept here (never deleted)."
            />

            <div className="mt-5 grid gap-3">
              {loading ? (
                <div className="h-12 rounded-xl bg-gray-100" />
              ) : completed?.length ? (
                <PastEpisodes uid={user.uid} episodes={completed} onOpen={(id) => navigate(`/episodes/${id}`)} />
              ) : (
                <div className="text-sm text-gray-600">No past episodes yet.</div>
              )}
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}

function PastEpisodes({ uid, episodes, onOpen }) {
  const [summaries, setSummaries] = useState({});
  const [summariesLoading, setSummariesLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!episodes?.length) {
        if (alive) {
          setSummaries({});
          setSummariesLoading(false);
        }
        return;
      }

      setSummariesLoading(true);
      try {
        const pairs = await Promise.all(
          episodes.map(async (ep) => {
            const entries = await getEpisodeEntries(uid, ep.id);
            const original = entries.find((entry) => entry.type === "original") || null;
            return [ep.id, original];
          })
        );

        if (alive) setSummaries(Object.fromEntries(pairs));
      } finally {
        if (alive) setSummariesLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [uid, episodes]);

  return episodes.map((ep) => (
    <EpisodeCard
      key={ep.id}
      title="Completed episode"
      date={ep.completedAt || ep.createdAt}
      symptoms={summaries[ep.id]?.symptoms || []}
      loadingSymptoms={summariesLoading && !(ep.id in summaries)}
      onClick={() => onOpen(ep.id)}
    />
  ));
}

