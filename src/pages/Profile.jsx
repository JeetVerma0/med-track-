import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, LogOut, ArrowLeft, Plus, Trash2, Users } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { BLOOD_GROUPS, SEX_OPTIONS, getUserProfile, upsertUserProfile } from "../services/db";
import { logout } from "../services/auth";
import { Button, Card, Container, Input, SectionTitle, Select, Textarea } from "../components/Ui";
import { withTimeout } from "../utils/withTimeout";

function emptyFamilyProfile() {
  return { id: Date.now().toString(), name: "", age: "", sex: "", bloodGroup: "", existingConditions: "", allergies: "" };
}

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
    allergies: "",
    familyProfiles: [],
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
        allergies: profile?.allergies || "",
        familyProfiles: profile?.familyProfiles || [],
      });
      setLoading(false);
    }
    run();
    return () => {
      alive = false;
    };
  }, [user]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addFamilyMember = () => {
    setForm(p => ({ ...p, familyProfiles: [...p.familyProfiles, emptyFamilyProfile()] }));
  };

  const removeFamilyMember = (id) => {
    setForm(p => ({ ...p, familyProfiles: p.familyProfiles.filter(f => f.id !== id) }));
  };

  const updateFamilyMember = (id, field, value) => {
    setForm(p => ({
      ...p,
      familyProfiles: p.familyProfiles.map(f => f.id === id ? { ...f, [field]: value } : f)
    }));
  };

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
        allergies: form.allergies.trim(),
        familyProfiles: form.familyProfiles.filter(f => f.name.trim()), // only save named profiles
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

        <div className="grid gap-6 pb-12">
          <Card className="p-6">
            <SectionTitle
              icon={<UserRound className="h-5 w-5" />}
              title="Primary Profile"
              subtitle="Your main health records."
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
                  <Input name="age" inputMode="numeric" value={form.age} onChange={onChange} placeholder="e.g. 21" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Sex</label>
                <div className="mt-2">
                  <Select name="sex" value={form.sex} onChange={onChange}>
                    <option value="">Select</option>
                    {SEX_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Blood Group</label>
                <div className="mt-2">
                  <Select name="bloodGroup" value={form.bloodGroup} onChange={onChange}>
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
                  </Select>
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="text-sm font-medium text-gray-700">Drug/Food Allergies</label>
                <div className="mt-2">
                  <Textarea name="allergies" value={form.allergies} onChange={onChange} placeholder="e.g. Penicillin, Peanuts..." />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="text-sm font-medium text-gray-700">Chronic Conditions</label>
                <div className="mt-2">
                  <Textarea name="existingConditions" value={form.existingConditions} onChange={onChange} placeholder="e.g. Asthma, diabetes..." />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle
              icon={<Users className="h-5 w-5" />}
              title="Family Members"
              subtitle="Track health episodes for your children or parents."
              right={<Button variant="secondary" onClick={addFamilyMember}>+ Add</Button>}
            />

            <div className="mt-6 grid gap-6">
              {form.familyProfiles.length === 0 && (
                <div className="text-sm text-gray-500 italic">No family members added yet.</div>
              )}
              {form.familyProfiles.map((member) => (
                <div key={member.id} className="relative rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
                  <button
                    onClick={() => removeFamilyMember(member.id)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="grid gap-4 pr-6 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Name</label>
                      <Input value={member.name} onChange={e => updateFamilyMember(member.id, 'name', e.target.value)} placeholder="Member Name" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Age</label>
                      <Input value={member.age} inputMode="numeric" onChange={e => updateFamilyMember(member.id, 'age', e.target.value)} placeholder="Age" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Sex</label>
                      <Select value={member.sex} onChange={e => updateFamilyMember(member.id, 'sex', e.target.value)}>
                        <option value="">Select</option>
                        {SEX_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Blood Group</label>
                      <Select value={member.bloodGroup} onChange={e => updateFamilyMember(member.id, 'bloodGroup', e.target.value)}>
                        <option value="">Select</option>
                        {BLOOD_GROUPS.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}

