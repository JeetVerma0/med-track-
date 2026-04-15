import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileUp, Pill, Stethoscope } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button, Card, Container, Input, SectionTitle, Select } from "../components/Ui";
import { createEpisode, getActiveEpisodes, MED_SOURCE_OPTIONS, SYMPTOM_OPTIONS } from "../services/db";
import { uploadPrescription } from "../services/storage";

function emptyMedicine() {
  return { name: "", duration: "" };
}

export default function NewEpisodePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [saving, setSaving] = useState(false);
  const [symptoms, setSymptoms] = useState([]);
  const [medicationSource, setMedicationSource] = useState(MED_SOURCE_OPTIONS[0]);
  const [medicines, setMedicines] = useState([emptyMedicine()]);
  const [prescriptionFile, setPrescriptionFile] = useState(null);

  const canSave = useMemo(() => symptoms.length > 0, [symptoms.length]);

  const toggleSymptom = (s) => {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const updateMedicine = (idx, key, value) => {
    setMedicines((prev) => prev.map((m, i) => (i === idx ? { ...m, [key]: value } : m)));
  };

  const addMedicineRow = () => setMedicines((prev) => [...prev, emptyMedicine()]);
  const removeMedicineRow = (idx) =>
    setMedicines((prev) => prev.filter((_, i) => i !== idx).length ? prev.filter((_, i) => i !== idx) : [emptyMedicine()]);

  const onSave = async () => {
    if (!user) return;
    if (!canSave) {
      alert("Please select at least one symptom.");
      return;
    }

    setSaving(true);
    try {
      // Keep the app simple: only one active episode at a time.
      // If an active episode exists, user should continue it (append updates) instead of starting another.
      const active = await getActiveEpisodes(user.uid);
      if (active?.[0]) {
        alert("You already have an active episode. Please continue it, or mark it as cured first.");
        navigate(`/episodes/${active[0].id}`, { replace: true });
        return;
      }

      const cleanedMeds = medicines
        .map((m) => ({ name: m.name.trim(), duration: m.duration.trim() }))
        .filter((m) => m.name);

      let prescriptionUrl = "";
      if (prescriptionFile) {
        prescriptionUrl = await uploadPrescription({ uid: user.uid, file: prescriptionFile });
      }

      await createEpisode(user.uid, {
        original: {
          symptoms,
          medicationSource,
          medicines: cleanedMeds,
          prescriptionUrl,
        },
      });

      // After creating the first entry, go back to dashboard (as requested).
      // The episode will show under "Current Health Episode".
      navigate("/dashboard", { replace: true });
    } catch (e) {
      alert(e.message || "Failed to create episode");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f9fafb]">
      <Container>
        <div className="py-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>

        <Card className="p-6">
          <SectionTitle
            icon={<Stethoscope className="h-5 w-5" />}
            title="Create Health Episode"
            subtitle="This is the original episode entry (read-only later)."
          />

          <div className="mt-6 grid gap-6">
            <div>
              <div className="text-sm font-medium text-gray-700">Symptoms</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {SYMPTOM_OPTIONS.map((s) => {
                  const checked = symptoms.includes(s);
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-gray-700">Medication Source</div>
                <div className="mt-2">
                  <Select value={medicationSource} onChange={(e) => setMedicationSource(e.target.value)}>
                    {MED_SOURCE_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700">Prescription (optional)</div>
                <div className="mt-2">
                  <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">
                    <FileUp className="h-4 w-4" />
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
            </div>

            <div>
              <SectionTitle
                icon={<Pill className="h-5 w-5" />}
                title="Medicines"
                subtitle="Add what you started taking (optional)."
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
                        placeholder="Duration (e.g. 5 days)"
                      />
                      <button
                        type="button"
                        onClick={() => removeMedicineRow(idx)}
                        className="h-11 rounded-xl px-3 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                        aria-label="Remove medicine row"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save Episode"}
            </Button>
          </div>
        </Card>
      </Container>
    </main>
  );
}

