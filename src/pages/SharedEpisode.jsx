import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Stethoscope,
  History,
  CheckCircle2,
  FileImage,
  LineChart as LineChartIcon
} from "lucide-react";
import { getEpisode, getEpisodeEntries, getUserProfile } from "../services/db";
import { Card, Container, SectionTitle } from "../components/Ui";
import { formatDateTime } from "../utils/date";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from "../components/ThemeContext";

export default function SharedEpisodePage() {
  const { uid, episodeId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [episode, setEpisode] = useState(null);
  const [entries, setEntries] = useState([]);
  const [profile, setProfile] = useState(null);

  const isCompleted = episode?.status === "Completed";
  const original = useMemo(() => entries.find((e) => e.type === "original"), [entries]);
  const continuations = useMemo(() => entries.filter((e) => e.type === "update"), [entries]);

  const chartData = useMemo(() => {
    return continuations
      .filter(e => e.vitals && (e.vitals.temp || e.vitals.bp || e.vitals.oxygen))
      .map(e => ({
        date: formatDateTime(e.createdAt),
        temp: parseFloat(e.vitals.temp) || null,
        oxygen: parseFloat(e.vitals.oxygen) || null,
      }));
  }, [continuations]);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!uid || !episodeId) return;
      setLoading(true);
      try {
        const [ep, en, prof] = await Promise.all([
          getEpisode(uid, episodeId),
          getEpisodeEntries(uid, episodeId),
          getUserProfile(uid),
        ]);
        if (!alive) return;
        if (!ep) {
          setError("Episode not found or access denied.");
        } else {
          setEpisode(ep);
          setEntries(en);
          setProfile(prof);
        }
      } catch (err) {
        if (alive) setError(err.message || "Failed to load shared episode.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [uid, episodeId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f9fafb] dark:bg-slate-900">
        <Container>
          <div className="py-10 text-center text-slate-500">Loading shared record...</div>
        </Container>
      </main>
    );
  }

  if (error || !episode) {
    return (
      <main className="min-h-screen bg-[#f9fafb] dark:bg-slate-900">
        <Container>
          <div className="py-10 text-center text-red-500">{error || "Not found"}</div>
        </Container>
      </main>
    );
  }

  const patientName = profile?.name || "Patient";

  return (
    <main className="min-h-screen bg-[#f9fafb] dark:bg-slate-900 pt-10 pb-20">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Medical Record</h1>
          <p className="text-slate-500 mt-2">
            Patient: <span className="font-semibold text-slate-800 dark:text-slate-200">{patientName}</span>
          </p>
          <div className="mt-2 text-sm text-slate-400">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 className="w-4 h-4"/> Resolved Episode</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-blue-600"><History className="w-4 h-4"/> Active Episode</span>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <SectionTitle
              icon={<Stethoscope className="h-5 w-5" />}
              title="Initial Diagnosis"
              subtitle={episode?.createdAt ? formatDateTime(episode.createdAt) : ""}
            />
            <div className="mt-5 grid gap-3 text-sm text-gray-800 dark:text-gray-200">
              <DetailRow label="Initial symptoms" value={(original?.symptoms || []).join(", ") || "—"} />
              <DetailRow
                label="Initial medicines"
                value={
                  original?.medicines?.length
                    ? original.medicines.map((m) => `${m.name}${m.duration ? ` (${m.duration})` : ""}`).join(", ")
                    : "—"
                }
              />
              <DetailRow label="Medication source" value={original?.medicationSource || "—"} />
              <div className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 dark:bg-slate-800 px-3 py-2 ring-1 ring-gray-200 dark:ring-slate-700">
                <div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Prescription</div>
                  <div className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                    {original?.prescriptionUrl ? (
                      <a href={original.prescriptionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#3b82f6] hover:underline">
                        <FileImage className="h-4 w-4" /> View image
                      </a>
                    ) : "—"}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {chartData.length > 0 && (
            <Card className="p-6">
              <SectionTitle
                icon={<LineChartIcon className="h-5 w-5" />}
                title="Vitals Trend"
              />
              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => val.split(',')[0]} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6b7280' }} domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#6b7280' }} domain={['dataMin - 2', 100]} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                    <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} name="Temp (°F)" />
                    <Line yAxisId="right" type="monotone" dataKey="oxygen" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} name="SpO2 (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <SectionTitle
              icon={<History className="h-5 w-5" />}
              title="Continuations & Updates"
            />
            <div className="mt-5 grid gap-3">
              {continuations.length ? (
                continuations.map((entry, idx) => (
                  <ContinuationEntry key={entry.id} entry={entry} index={idx} total={continuations.length} />
                ))
              ) : (
                <div className="text-sm text-gray-500">No updates.</div>
              )}
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 dark:bg-slate-800 px-3 py-2 ring-1 ring-gray-200 dark:ring-slate-700">
      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</div>
      <div className="text-right text-sm text-gray-800 dark:text-gray-200">{value}</div>
    </div>
  );
}

function ContinuationEntry({ entry, index, total }) {
  const added = (entry.symptomsAdded || []).join(", ");
  const resolved = (entry.symptomsResolved || []).join(", ");
  const medicines = entry.medicines?.length
    ? entry.medicines.map((m) => `${m.name}${m.duration ? ` (${m.duration})` : ""}`).join(", ")
    : "";
  const doctor =
    entry.doctorVisit && (entry.doctorVisit.doctorName || entry.doctorVisit.notes)
      ? `${entry.doctorVisit.doctorName || "Doctor"}${entry.doctorVisit.notes ? `: ${entry.doctorVisit.notes}` : ""}`
      : "";

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm ring-1 ring-gray-200 dark:ring-slate-700">
      <div className="text-sm font-semibold text-gray-900 dark:text-white">{`Update ${index + 1}`}</div>
      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{formatDateTime(entry.createdAt) || "—"}</div>
      
      <div className="mt-3 grid gap-2 text-sm text-gray-800 dark:text-gray-200">
        {added && <div><span className="font-medium text-gray-500 dark:text-gray-400">Added:</span> {added}</div>}
        {resolved && <div><span className="font-medium text-gray-500 dark:text-gray-400">Resolved:</span> {resolved}</div>}
        {entry.vitals && (entry.vitals.temp || entry.vitals.bp || entry.vitals.oxygen) && (
          <div><span className="font-medium text-gray-500 dark:text-gray-400">Vitals:</span> {[
            entry.vitals.temp ? `Temp: ${entry.vitals.temp}°F` : "",
            entry.vitals.bp ? `BP: ${entry.vitals.bp}` : "",
            entry.vitals.oxygen ? `SpO2: ${entry.vitals.oxygen}%` : ""
          ].filter(Boolean).join(" | ")}</div>
        )}
        {medicines && <div><span className="font-medium text-gray-500 dark:text-gray-400">Medicines:</span> {medicines}</div>}
        {doctor && <div><span className="font-medium text-gray-500 dark:text-gray-400">Doctor:</span> {doctor}</div>}
        {entry.prescriptionUrl && (
          <div className="mt-2">
            <a href={entry.prescriptionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-500 hover:underline">
              <FileImage className="h-4 w-4" /> View Prescription
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
