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
} from "lucide-react";
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

  const [adding, setAdding] = useState(false);
  const [symptomsNow, setSymptomsNow] = useState([]);
  const [resolvedSymptoms, setResolvedSymptoms] = useState([]);
  const [otherSymptoms, setOtherSymptoms] = useState("");
  const [medicines, setMedicines] = useState([emptyMedicine()]);
  const [doctorVisit, setDoctorVisit] = useState({ doctorName: "", place: "", notes: "" });
  const [prescriptionFile, setPrescriptionFile] = useState(null);

  const isCompleted = episode?.status === "Completed";
  const original = useMemo(() => entries.find((e) => e.type === "original"), [entries]);
  const continuations = useMemo(() => entries.filter((e) => e.type === "update"), [entries]);
  const currentSymptoms = useMemo(() => computeCurrentSymptoms(entries), [entries]);

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
    // After curing, send user back to Dashboard so it appears in Past Episodes.
    navigate("/dashboard", { replace: true });
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
        prescriptionUrl,
      });

      setSymptomsNow([]);
      setResolvedSymptoms([]);
      setOtherSymptoms("");
      setMedicines([emptyMedicine()]);
      setDoctorVisit({ doctorName: "", place: "", notes: "" });
      setPrescriptionFile(null);
      // After saving an update, return to dashboard for reminders + quick overview.
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
      <main className="min-h-screen bg-[#f9fafb]">
        <Container>
          <div className="py-10">
            <Card className="p-6">
              <div className="h-3 w-40 rounded bg-gray-100" />
              <div className="mt-4 h-20 rounded-xl bg-gray-100" />
            </Card>
          </div>
        </Container>
      </main>
    );
  }

  if (!episode) {
    return (
      <main className="min-h-screen bg-[#f9fafb]">
        <Container>
          <div className="py-10">
            <Card className="p-6">
              <div className="text-sm text-gray-700">Episode not found.</div>
            </Card>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f9fafb]">
      <Container>
        <div className="flex items-center justify-between py-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <Button onClick={onDownload}>
            <Download className="h-4 w-4" /> Download Report (PDF)
          </Button>
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

