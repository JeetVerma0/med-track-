import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, LogOut, ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { BLOOD_GROUPS, SEX_OPTIONS, getUserProfile, upsertUserProfile } from "../services/db";
import { logout } from "../services/auth";
import { Button, Card, Container, Input, SectionTitle, Select, Textarea } from "../components/Ui";
import { withTimeout } from "../utils/withTimeout";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    sex: "",
    bloodGroup: "",
    existingConditions: "",
  });

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!user) return;
      let profile = null;
      try {
        profile = await withTimeout(getUserProfile(user.uid), 12000, "Loading profile");
      } catch {
        profile = null;
      }
      if (!alive) return;
      setForm({
        name: profile?.name || user.displayName || "",
        age: profile?.age || "",
        sex: profile?.sex || "",
        bloodGroup: profile?.bloodGroup || "",
        existingConditions: profile?.existingConditions || "",
      });
      setLoading(false);
    }
    run();
    return () => {
      alive = false;
    };
  }, [user]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await upsertUserProfile(user.uid, {
        name: form.name.trim(),
        age: String(form.age).trim(),
        sex: form.sex,
        bloodGroup: form.bloodGroup,
        existingConditions: form.existingConditions.trim(),
        email: user.email || "",
      });
      navigate("/dashboard");
    } catch (e) {
      alert(e.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f9fafb]">
        <Container>
          <div className="py-10">
            <Card className="p-6">
              <div className="h-3 w-36 rounded bg-gray-100" />
              <div className="mt-4 h-10 w-full rounded-xl bg-gray-100" />
              <div className="mt-3 h-10 w-full rounded-xl bg-gray-100" />
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
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        <Card className="p-6">
          <SectionTitle
            icon={<UserRound className="h-5 w-5" />}
            title="Profile"
            subtitle="This helps keep your health records meaningful."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <div className="mt-2">
                <Input name="name" value={form.name} onChange={onChange} placeholder="Your name" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Age</label>
              <div className="mt-2">
                <Input
                  name="age"
                  inputMode="numeric"
                  value={form.age}
                  onChange={onChange}
                  placeholder="e.g. 21"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Sex</label>
              <div className="mt-2">
                <Select name="sex" value={form.sex} onChange={onChange}>
                  <option value="">Select</option>
                  {SEX_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Blood Group</label>
              <div className="mt-2">
                <Select name="bloodGroup" value={form.bloodGroup} onChange={onChange}>
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Existing Conditions (optional)
              </label>
              <div className="mt-2">
                <Textarea
                  name="existingConditions"
                  value={form.existingConditions}
                  onChange={onChange}
                  placeholder="e.g. Asthma, diabetes, allergy..."
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>
      </Container>
    </main>
  );
}

