import jsPDF from "jspdf";
import { formatDateTime } from "./date";

function safeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [String(value)];
}

function addWrappedText(doc, text, x, y, maxWidth) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * 7;
}

export function downloadEpisodePdf({ episode, entries, profile }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  let y = 48;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Med Track — Health Episode Report", 40, y);

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(80);

  const metaLines = [
    profile?.name ? `Name: ${profile.name}` : null,
    profile?.age ? `Age: ${profile.age}` : null,
    profile?.sex ? `Sex: ${profile.sex}` : null,
    profile?.bloodGroup ? `Blood Group: ${profile.bloodGroup}` : null,
    episode?.status ? `Status: ${episode.status}` : null,
    episode?.createdAt ? `Episode Start: ${formatDateTime(episode.createdAt)}` : null,
    episode?.completedAt ? `Completed: ${formatDateTime(episode.completedAt)}` : null,
  ].filter(Boolean);

  metaLines.forEach((line) => {
    y += 16;
    doc.text(line, 40, y);
  });

  y += 22;
  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.text("Timeline", 40, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);

  y += 12;
  doc.setDrawColor(230);
  doc.line(40, y, 555, y);
  y += 14;

  const sorted = [...(entries || [])].sort((a, b) => {
    const ad = a?.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const bd = b?.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return ad - bd;
  });

  for (const entry of sorted) {
    const heading =
      entry.type === "original"
        ? `Original entry — ${formatDateTime(entry.createdAt)}`
        : `Update — ${formatDateTime(entry.createdAt)}`;

    if (y > 740) {
      doc.addPage();
      y = 48;
    }

    doc.setTextColor(20);
    doc.setFont("helvetica", "bold");
    doc.text(heading, 40, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(70);

    const symptomsAdded = safeList(entry.symptomsAdded || entry.symptoms);
    const symptomsResolved = safeList(entry.symptomsResolved);
    const medicines = safeList(entry.medicines)?.map((m) => {
      if (!m) return null;
      if (typeof m === "string") return m;
      const name = m?.name || "";
      const duration = m?.duration ? ` (${m.duration})` : "";
      return `${name}${duration}`.trim();
    }).filter(Boolean);

    const doctor =
      entry.doctorVisit && (entry.doctorVisit.doctorName || entry.doctorVisit.notes)
        ? `Doctor: ${entry.doctorVisit.doctorName || ""}${
            entry.doctorVisit.place ? `, ${entry.doctorVisit.place}` : ""
          }${entry.doctorVisit.notes ? ` — ${entry.doctorVisit.notes}` : ""}`.trim()
        : null;

    const source = entry.medicationSource ? `Medication source: ${entry.medicationSource}` : null;

    const parts = [
      symptomsAdded.length ? `Symptoms added: ${symptomsAdded.join(", ")}` : null,
      symptomsResolved.length ? `Symptoms resolved: ${symptomsResolved.join(", ")}` : null,
      medicines.length ? `Medicines: ${medicines.join(", ")}` : null,
      source,
      doctor,
    ].filter(Boolean);

    if (!parts.length) {
      doc.text("No details recorded.", 40, y);
      y += 18;
    } else {
      for (const p of parts) {
        y = addWrappedText(doc, p, 40, y, 515);
        y += 2;
      }
      y += 8;
    }

    doc.setTextColor(200);
    doc.line(40, y, 555, y);
    y += 18;
  }

  doc.save(`med-track-episode-${episode?.id || "report"}.pdf`);
}

