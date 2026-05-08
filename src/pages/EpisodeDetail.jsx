import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileImage,
  History,
  PencilLine,
  Stethoscope,
  LineChart as LineChartIcon,
  Share2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from "../hooks/useAuth";
import {
  addContinuation,
  getEpisode,
  getEpisodeEntries,
  markEpisodeCompleted,
  SYMPTOM_OPTIONS,
} from "../services/db";
import { uploadPrescription } from "../services/storage";
import { getUserProfile } from "../services/db";
import { Button, Card, Container, Input, SectionTitle, Textarea } from "../components/Ui";
import { formatDateTime } from "../utils/date";
import { downloadEpisodePdf } from "../utils/pdfGenerator";
import { computeCurrentSymptoms } from "../utils/episodeState";

function emptyMedicine() {
  return { name: "", duration: "" };
}

export default function EpisodeDetailPage() {
  const { episodeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [episode, setEpisode] = useState(null);
  const [entries, setEntries] = useState([]);
  const [profile, setProfile] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [adding, setAdding] = useState(false);
  const [symptomsNow, setSymptomsNow] = useState([]);
  const [resolvedSymptoms, setResolvedSymptoms] = useState([]);
  const [otherSymptoms, setOtherSymptoms] = useState("");
  const [medicines, setMedicines] = useState([emptyMedicine()]);
  const [doctorVisit, setDoctorVisit] = useState({ doctorName: "", place: "", notes: "" });
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [vitals, setVitals] = useState({ temp: "", bp: "", oxygen: "" });

  const isCompleted = episode?.status === "Completed";
  const original = useMemo(() => entries.find((e) => e.type === "original"), [entries]);
  const continuations = useMemo(() => entries.filter((e) => e.type === "update"), [entries]);
  const currentSymptoms = useMemo(() => computeCurrentSymptoms(entries), [entries]);

  const chartData = useMemo(() => {
    return continuations
      .filter(e => e.vitals && (e.vitals.temp || e.vitals.bp || e.vitals.oxygen))
      .map(e => ({
        date: formatDateTime(e.createdAt),
        temp: parseFloat(e.vitals.temp) || null,
        oxygen: parseFloat(e.vitals.oxygen) || null,
      }));
  }, [continuations]);

  const load = async () => {
    if (!user || !episodeId) return;
    setLoading(true);
    const [ep, en, prof] = await Promise.all([
      getEpisode(user.uid, episodeId),
      getEpisodeEntries(user.uid, episodeId),
      getUserProfile(user.uid),
    ]);
    setEpisode(ep);
    setEntries(en);
    setProfile(prof);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, episodeId]);

  const toggleSymptom = (s) => {
    setSymptomsNow((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const updateMedicine = (idx, key, value) => {
    setMedicines((prev) => prev.map((m, i) => (i === idx ? { ...m, [key]: value } : m)));
  };

  const addMedicineRow = () => setMedicines((prev) => [...prev, emptyMedicine()]);
  const removeMedicineRow = (idx) =>
    setMedicines((prev) => prev.filter((_, i) => i !== idx).length ? prev.filter((_, i) => i !== idx) : [emptyMedicine()]);

  const onMarkCured = async () => {
    if (!user) return;
    const ok = confirm("Mark this episode as completed (cured)? You won't be able to add more updates.");
    if (!ok) return;
    await markEpisodeCompleted(user.uid, episodeId);
    navigate("/dashboard", { replace: true });
  };

  const onShare = () => {
    const link = `${window.location.origin}/shared/${user.uid}/${episodeId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const onAddContinuation = async () => {
    if (!user) return;
    setAdding(true);
    try {
      const cleanedMeds = medicines
        .map((m) => ({ name: m.name.trim(), duration: m.duration.trim() }))
        .filter((m) => m.name);

      const extra = otherSymptoms
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      let prescriptionUrl = "";
      if (prescriptionFile) {
        prescriptionUrl = await uploadPrescription({ uid: user.uid, episodeId, file: prescriptionFile });
      }

      await addContinuation(user.uid, episodeId, {
        symptomsAdded: [...symptomsNow, ...extra],
        symptomsResolved: resolvedSymptoms,
        medicines: cleanedMeds,
        doctorVisit: {
          doctorName: doctorVisit.doctorName.trim(),
          place: doctorVisit.place.trim(),
          notes: doctorVisit.notes.trim(),
        },
        vitals: {
          temp: vitals.temp.trim(),
          bp: vitals.bp.trim(),
          oxygen: vitals.oxygen.trim(),
        },
        prescriptionUrl,
      });

      setSymptomsNow([]);
      setResolvedSymptoms([]);
      setOtherSymptoms("");
      setMedicines([emptyMedicine()]);
      setDoctorVisit({ doctorName: "", place: "", notes: "" });
      setPrescriptionFile(null);
      setVitals({ temp: "", bp: "", oxygen: "" });
      navigate("/dashboard", { replace: true });
    } catch (e) {
      alert(e.message || "Failed to add update");
    } finally {
      setAdding(false);
    }
  };

  const onDownload = () => {
    downloadEpisodePdf({ episode: { ...episode, id: episodeId }, entries, profile });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f9fafb] dark:bg-slate-900">
        <Container>
          <div className="py-10">
            <Card className="p-6">
              <div className="h-3 w-40 rounded bg-gray-100 dark:bg-slate-700" />
              <div className="mt-4 h-20 rounded-xl bg-gray-100 dark:bg-slate-700" />
            </Card>
          </div>
        </Container>
      </main>
    );
  }

  if (!episode) {
    return (
      <main className="min-h-screen bg-[#f9fafb] dark:bg-slate-900">
        <Container>
          <div className="py-10">
            <Card className="p-6">
              <div className="text-sm text-gray-700 dark:text-gray-300">Episode not found.</div>
            </Card>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f9fafb] dark:bg-slate-900">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onShare}>
              <Share2 className="h-4 w-4" /> {copiedLink ? "Copied Link!" : "Share Link"}
            </Button>
            <Button onClick={onDownload}>
              <Download className="h-4 w-4" /> Download Report (PDF)
            </Button>
          </div>
        </div>

        <div className="grid gap-6 pb-12">
          <Card className="p-6">
            <SectionTitle
              icon={<Stethoscope className="h-5 w-5" />}
              title="Original Episode (read-only)"
              subtitle={episode?.createdAt ? `Started: ${formatDateTime(episode.createdAt)}` : ""}
            />

            <div className="mt-5 grid gap-3 text-sm text-gray-800">
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
              <div className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-gray-200">
                <div>
                  <div className="text-xs font-medium text-gray-600">Prescription</div>
                  <div className="mt-1 text-sm text-gray-800">
                    {original?.prescriptionUrl ? (
                      <a
                        href={original.prescriptionUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={original.prescriptionUrl.startsWith("data:") ? "prescription.jpg" : undefined}
                        className="inline-flex items-center gap-2 text-[#3b82f6] hover:underline"
                      >
                        <FileImage className="h-4 w-4" /> View uploaded image
                      </a>
                    ) : (
                      "—"
                    )}
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
                subtitle="Visualized temperature and oxygen levels over time."
              />
              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => val.split(',')[0]} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6b7280' }} domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#6b7280' }} domain={['dataMin - 2', 100]} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                    <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Temp (°F)" />
                    <Line yAxisId="right" type="monotone" dataKey="oxygen" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="SpO2 (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <SectionTitle
              icon={<History className="h-5 w-5" />}
              title="Continuation Information"
              subtitle="Every continuation update is stacked here for quick context."
            />

            <div className="mt-5 grid gap-3">
              {continuations.length ? (
                continuations.map((entry, idx) => (
                  <ContinuationEntry key={entry.id} entry={entry} index={idx} total={continuations.length} />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  No continuation updates yet.
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle
              icon={isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <PencilLine className="h-5 w-5" />}
              title="Status"
              subtitle={isCompleted ? "This episode is completed (read-only)." : "You can continue adding updates."}
              right={
                isCompleted ? null : (
                  <Button variant="danger" onClick={onMarkCured}>
                    Mark as Cured
                  </Button>
                )
              }
            />
          </Card>

          {!isCompleted ? (
            <Card className="p-6">
              <SectionTitle
                icon={<PencilLine className="h-5 w-5" />}
                title="Add Continuation"
                subtitle="This creates a new update entry (nothing is overwritten)."
              />

              <div className="mt-6 grid gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-700">Previous symptoms status</div>
                  <div className="mt-2 text-sm text-gray-600">
                    Mark symptoms that are now resolved (optional).
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {(currentSymptoms || []).length ? (
                      currentSymptoms.map((s) => {
                        const checked = resolvedSymptoms.includes(s);
                        return (
                          <label
                            key={s}
                            className="flex cursor-pointer items-center gap-3 rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-gray-200 hover:bg-gray-100"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setResolvedSymptoms((prev) =>
                                  prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                                )
                              }
                              className="h-4 w-4 rounded border-gray-300 text-[#3b82f6] focus:ring-blue-200"
                            />
                            <span className="text-sm text-gray-800">{s}</span>
                          </label>
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-600">No symptoms to mark yet.</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">Symptoms now (optional)</div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {SYMPTOM_OPTIONS.map((s) => {
                      const checked = symptomsNow.includes(s);
                      return (
                        <label
                          key={s}
                          className="flex cursor-pointer items-center gap-3 rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-gray-200 hover:bg-gray-100"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSymptom(s)}
                            className="h-4 w-4 rounded border-gray-300 text-[#22c55e] focus:ring-green-200"
                          />
                          <span className="text-sm text-gray-800">{s}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-3">
                    <Input
                      value={otherSymptoms}
                      onChange={(e) => setOtherSymptoms(e.target.value)}
                      placeholder="Other symptoms (comma separated, optional)"
                    />
                  </div>
                </div>

                <div>
                  <SectionTitle
                    icon={<span className="text-sm font-semibold text-gray-700">❤️</span>}
                    title="Vitals (optional)"
                  />
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Temperature (°F)</label>
                      <div className="mt-2">
                        <Input value={vitals.temp} onChange={(e) => setVitals(v => ({ ...v, temp: e.target.value }))} placeholder="e.g. 101.2" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Blood Pressure</label>
                      <div className="mt-2">
                        <Input value={vitals.bp} onChange={(e) => setVitals(v => ({ ...v, bp: e.target.value }))} placeholder="e.g. 120/80" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Oxygen (SpO2 %)</label>
                      <div className="mt-2">
                        <Input value={vitals.oxygen} onChange={(e) => setVitals(v => ({ ...v, oxygen: e.target.value }))} placeholder="e.g. 98" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <SectionTitle
                    icon={<span className="text-sm font-semibold text-gray-700">Rx</span>}
                    title="Medicines (optional)"
                    right={
                      <Button variant="secondary" onClick={addMedicineRow}>
                        + Add
                      </Button>
                    }
                  />

                  <div className="mt-4 grid gap-3">
                    {medicines.map((m, idx) => (
                      <div key={idx} className="grid gap-3 md:grid-cols-5">
                        <div className="md:col-span-3">
                          <Input
                            value={m.name}
                            onChange={(e) => updateMedicine(idx, "name", e.target.value)}
                            placeholder="Medicine name"
                            list="medicine-list"
                          />
                        </div>
                        <div className="md:col-span-2 flex gap-3">
                          <Input
                            value={m.duration}
                            onChange={(e) => updateMedicine(idx, "duration", e.target.value)}
                            placeholder="Duration"
                          />
                          <button
                            type="button"
                            onClick={() => removeMedicineRow(idx)}
                            className="h-11 rounded-xl px-3 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <datalist id="medicine-list">
                    <option value="Paracetamol" />
                    <option value="Ibuprofen" />
                    <option value="Amoxicillin" />
                    <option value="Cetirizine" />
                    <option value="Azithromycin" />
                    <option value="Cough Syrup" />
                  </datalist>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-1">
                    <div className="text-sm font-medium text-gray-700">Doctor name (optional)</div>
                    <div className="mt-2">
                      <Input
                        value={doctorVisit.doctorName}
                        onChange={(e) => setDoctorVisit((p) => ({ ...p, doctorName: e.target.value }))}
                        placeholder="Dr. Name"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <div className="text-sm font-medium text-gray-700">Place / clinic (optional)</div>
                    <div className="mt-2">
                      <Input
                        value={doctorVisit.place}
                        onChange={(e) => setDoctorVisit((p) => ({ ...p, place: e.target.value }))}
                        placeholder="Hospital / clinic"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <div className="text-sm font-medium text-gray-700">Prescription image (optional)</div>
                    <div className="mt-2">
                      <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">
                        <FileImage className="h-4 w-4" />
                        <span>{prescriptionFile ? prescriptionFile.name : "Upload image"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setPrescriptionFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <div className="text-sm font-medium text-gray-700">Doctor notes (optional)</div>
                    <div className="mt-2">
                      <Textarea
                        value={doctorVisit.notes}
                        onChange={(e) => setDoctorVisit((p) => ({ ...p, notes: e.target.value }))}
                        placeholder="What did the doctor say? Tests? Advice?"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={onAddContinuation} disabled={adding}>
                  {adding ? "Saving..." : "Save Update"}
                </Button>
              </div>
            </Card>
          ) : null}

          <Card className="p-6">
            <SectionTitle
              icon={<History className="h-5 w-5" />}
              title="Timeline"
              subtitle="Original entry + every continuation update."
            />

            <div className="mt-5 grid gap-3">
              {entries.length ? (
                entries.map((e) => <TimelineEntry key={e.id} entry={e} />)
              ) : (
                <div className="text-sm text-gray-600">No timeline entries found.</div>
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
    <div className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-gray-200">
      <div className="text-xs font-medium text-gray-600">{label}</div>
      <div className="text-right text-sm text-gray-800">{value}</div>
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
      ? `${entry.doctorVisit.doctorName || "Doctor visit"}${
          entry.doctorVisit.place ? ` — ${entry.doctorVisit.place}` : ""
        }${entry.doctorVisit.notes ? `: ${entry.doctorVisit.notes}` : ""}`
      : "";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">{`Continuation ${index + 1} of ${total}`}</div>
          <div className="mt-1 text-xs text-gray-600">{formatDateTime(entry.createdAt) || "—"}</div>
        </div>
        {entry.prescriptionUrl ? (
          <a
            href={entry.prescriptionUrl}
            target="_blank"
            rel="noreferrer"
            download={entry.prescriptionUrl.startsWith("data:") ? "prescription.jpg" : undefined}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs font-medium text-[#3b82f6] ring-1 ring-gray-200 hover:bg-gray-100"
          >
            <FileImage className="h-4 w-4" />
            Prescription
          </a>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 text-sm text-gray-800">
        <div>
          <span className="font-medium text-gray-700">Symptoms added:</span>{" "}
          <span className="text-gray-800">{added || "—"}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Symptoms resolved:</span>{" "}
          <span className="text-gray-800">{resolved || "—"}</span>
        </div>
        {entry.vitals && (entry.vitals.temp || entry.vitals.bp || entry.vitals.oxygen) && (
          <div>
            <span className="font-medium text-gray-700">Vitals:</span>{" "}
            <span className="text-gray-800">
              {[
                entry.vitals.temp ? `Temp: ${entry.vitals.temp}°F` : "",
                entry.vitals.bp ? `BP: ${entry.vitals.bp}` : "",
                entry.vitals.oxygen ? `SpO2: ${entry.vitals.oxygen}%` : ""
              ].filter(Boolean).join(" | ")}
            </span>
          </div>
        )}
        <div>
          <span className="font-medium text-gray-700">Medicines:</span>{" "}
          <span className="text-gray-800">{medicines || "—"}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Doctor:</span>{" "}
          <span className="text-gray-800">{doctor || "—"}</span>
        </div>
      </div>
    </div>
  );
}

function TimelineEntry({ entry }) {
  const title = entry.type === "original" ? "Original episode" : "Continuation update";
  const symptoms = (entry.symptoms || []).join(", ");
  const symptomsAdded = (entry.symptomsAdded || []).join(", ");
  const medicines = entry.medicines?.length
    ? entry.medicines.map((m) => `${m.name}${m.duration ? ` (${m.duration})` : ""}`).join(", ")
    : "";
  const doctor =
    entry.doctorVisit && (entry.doctorVisit.doctorName || entry.doctorVisit.notes)
      ? `${entry.doctorVisit.doctorName || "Doctor visit"}${
          entry.doctorVisit.place ? ` — ${entry.doctorVisit.place}` : ""
        }${entry.doctorVisit.notes ? `: ${entry.doctorVisit.notes}` : ""}`
      : "";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          <div className="mt-1 text-xs text-gray-600">{formatDateTime(entry.createdAt) || "—"}</div>
        </div>
        {entry.prescriptionUrl ? (
          <a
            href={entry.prescriptionUrl}
            target="_blank"
            rel="noreferrer"
            download={entry.prescriptionUrl.startsWith("data:") ? "prescription.jpg" : undefined}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs font-medium text-[#3b82f6] ring-1 ring-gray-200 hover:bg-gray-100"
          >
            <FileImage className="h-4 w-4" />
            Prescription
          </a>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 text-sm text-gray-800">
        {symptomsAdded || symptoms ? (
          <div>
            <span className="font-medium text-gray-700">Symptoms added:</span>{" "}
            <span className="text-gray-800">{symptomsAdded || symptoms}</span>
          </div>
        ) : null}
        {entry.symptomsResolved?.length ? (
          <div>
            <span className="font-medium text-gray-700">Symptoms resolved:</span>{" "}
            <span className="text-gray-800">{entry.symptomsResolved.join(", ")}</span>
          </div>
        ) : null}
        {entry.vitals && (entry.vitals.temp || entry.vitals.bp || entry.vitals.oxygen) && (
          <div>
            <span className="font-medium text-gray-700">Vitals:</span>{" "}
            <span className="text-gray-800">
              {[
                entry.vitals.temp ? `Temp: ${entry.vitals.temp}°F` : "",
                entry.vitals.bp ? `BP: ${entry.vitals.bp}` : "",
                entry.vitals.oxygen ? `SpO2: ${entry.vitals.oxygen}%` : ""
              ].filter(Boolean).join(" | ")}
            </span>
          </div>
        )}
        {medicines ? (
          <div>
            <span className="font-medium text-gray-700">Medicines:</span>{" "}
            <span className="text-gray-800">{medicines}</span>
          </div>
        ) : null}
        {doctor ? (
          <div>
            <span className="font-medium text-gray-700">Doctor:</span>{" "}
            <span className="text-gray-800">{doctor}</span>
          </div>
        ) : null}
        {!symptomsAdded && !symptoms && !medicines && !doctor ? (
          <div className="text-sm text-gray-600">No details recorded for this entry.</div>
        ) : null}
      </div>
    </div>
  );
}

