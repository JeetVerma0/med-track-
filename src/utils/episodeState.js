export function computeCurrentSymptoms(entries) {
  const sorted = [...(entries || [])].sort((a, b) => {
    const at = a?.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const bt = b?.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return at - bt;
  });

  const original = sorted.find((e) => e.type === "original");
  const current = new Set((original?.symptoms || []).filter(Boolean));

  for (const e of sorted) {
    if (e.type !== "update") continue;
    const added = (e.symptomsAdded || e.symptoms || []).filter(Boolean);
    const resolved = (e.symptomsResolved || []).filter(Boolean);
    for (const s of added) current.add(s);
    for (const s of resolved) current.delete(s);
  }

  return Array.from(current);
}

export function computeCurrentMedicines(entries) {
  const sorted = [...(entries || [])].sort((a, b) => {
    const at = a?.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const bt = b?.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return at - bt;
  });

  // Take latest entry that explicitly sets medicines (non-empty list)
  for (let i = sorted.length - 1; i >= 0; i--) {
    const meds = sorted[i]?.medicines;
    if (Array.isArray(meds) && meds.length) return meds;
  }
  return [];
}

