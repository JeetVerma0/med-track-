import pptxgen from "pptxgenjs";

// Absolute paths to the UI mockup images generated earlier (no file:// prefix)
const imgDashboard = "C:/Users/Jsola/.gemini/antigravity/brain/937eac6a-99ff-4d40-9378-7aa9059b4db8/dashboard_dark_1778238786383.png";
const imgEpisode   = "C:/Users/Jsola/.gemini/antigravity/brain/937eac6a-99ff-4d40-9378-7aa9059b4db8/episode_detail_demo_1778238805621.png";

let pptx = new pptxgen();

// Use a clean A4 layout (inches)
pptx.defineLayout({ name: "A4", width: 10, height: 7.5 });
pptx.layout = "A4";

// ---------------------------------------------------
// Slide 1 – Title (simple solid background)
let s1 = pptx.addSlide();
s1.background = { color: "F9FAFB" };
s1.addText("Med‑Track", {
  x: 1, y: 1, w: 8, h: 1.2,
  fontSize: 48, bold: true,
  color: "0F172A", align: "center"
});
s1.addText("Your Personal & Family Health Companion", {
  x: 1, y: 2.4, w: 8, h: 0.8,
  fontSize: 24, color: "64748B", align: "center"
});

// ---------------------------------------------------
// Slide 2 – The Problem
let s2 = pptx.addSlide();
s2.addText("The Challenge of Managing Health Records", {
  x: 0.5, y: 0.5, w: 9, h: 0.8,
  fontSize: 30, bold: true, color: "0F172A"
});
s2.addText([
  { text: "Keeping track of symptoms over time is difficult.", options: { bullet: true } },
  { text: "Remembering past medications, durations, and doctor instructions is error‑prone.", options: { bullet: true } },
  { text: "Managing health records for multiple family members leads to fragmented data.", options: { bullet: true } },
  { text: "Communicating accurate medical history to doctors is often rushed and incomplete.", options: { bullet: true } }
], { x: 0.8, y: 1.5, w: 9, h: 3, fontSize: 18, color: "334155", bullet: true, margin: 5 });

// ---------------------------------------------------
// Slide 3 – Solution Overview (hero image of dashboard)
let s3 = pptx.addSlide();
s3.addText("Introducing Med‑Track", {
  x: 0.5, y: 0.5, w: 9, h: 0.8,
  fontSize: 30, bold: true, color: "0F172A"
});
s3.addImage({ path: imgDashboard, x: 0.5, y: 1.5, w: 9, h: 4 });
s3.addText([
  { text: "A unified, digital health diary.", options: { bullet: true } },
  { text: "Log symptoms, medications, and doctor visits in real‑time.", options: { bullet: true } },
  { text: "Visual trend analysis for vitals (temperature, SpO2).", options: { bullet: true } },
  { text: "Works offline as a PWA with dark mode.", options: { bullet: true } }
], { x: 0.8, y: 5.7, w: 9, h: 1.5, fontSize: 18, color: "334155", bullet: true, margin: 5 });

// ---------------------------------------------------
// Slide 4 – Core Capabilities (text left, episode screenshot right)
let s4 = pptx.addSlide();
s4.addText("Core Capabilities", {
  x: 0.5, y: 0.5, w: 9, h: 0.8,
  fontSize: 30, bold: true, color: "0F172A"
});
s4.addText([
  { text: "Dynamic Health Episodes – continuous updates.", options: { bullet: true } },
  { text: "Family Profiles – one account, many users.", options: { bullet: true } },
  { text: "Vitals Visualization – interactive charts.", options: { bullet: true } }
], { x: 0.8, y: 1.5, w: 4.2, h: 2.5, fontSize: 18, color: "334155", bullet: true, margin: 5 });
s4.addImage({ path: imgEpisode, x: 5.4, y: 1.3, w: 4.2, h: 3.5 });

// ---------------------------------------------------
// Slide 5 – Sharing & Accessibility
let s5 = pptx.addSlide();
s5.addText("Sharing & Accessibility", {
  x: 0.5, y: 0.5, w: 9, h: 0.8,
  fontSize: 30, bold: true, color: "0F172A"
});
s5.addText([
  { text: "Shareable Doctor Links – secure read‑only URLs.", options: { bullet: true } },
  { text: "PDF Export – one‑click medical report.", options: { bullet: true } },
  { text: "Progressive Web App – install on phone, offline use.", options: { bullet: true } },
  { text: "Dark Mode – eye‑friendly for night logging.", options: { bullet: true } }
], { x: 0.8, y: 1.5, w: 9, h: 2.5, fontSize: 18, color: "334155", bullet: true, margin: 5 });
// faint background visual (dashboard) – using low opacity via transparent PNG trick not needed; skip to avoid errors

// ---------------------------------------------------
// Slide 6 – Technology Stack
let s6 = pptx.addSlide();
s6.addText("Built for Speed & Reliability", {
  x: 0.5, y: 0.5, w: 9, h: 0.8,
  fontSize: 30, bold: true, color: "0F172A"
});
s6.addText([
  { text: "Frontend: React + Vite – lightning fast.", options: { bullet: true } },
  { text: "Styling: Tailwind CSS + glassmorphism – vibrant UI.", options: { bullet: true } },
  { text: "Backend: Firebase Auth & Firestore – real‑time syncing.", options: { bullet: true } },
  { text: "Charts: Recharts – responsive, interactive.", options: { bullet: true } }
], { x: 0.8, y: 1.5, w: 9, h: 2.5, fontSize: 18, color: "334155", bullet: true, margin: 5 });

// ---------------------------------------------------
// Slide 7 – Future Roadmap
let s7 = pptx.addSlide();
s7.addText("What’s Next?", {
  x: 0.5, y: 0.5, w: 9, h: 0.8,
  fontSize: 30, bold: true, color: "0F172A"
});
s7.addText([
  { text: "Smart Medication Reminders – push notifications.", options: { bullet: true } },
  { text: "AI Health Insights – detect recurring patterns.", options: { bullet: true } },
  { text: "Wearable Integration – Apple Health, Fitbit.", options: { bullet: true } }
], { x: 0.8, y: 1.5, w: 9, h: 2.5, fontSize: 18, color: "334155", bullet: true, margin: 5 });

// ---------------------------------------------------
// Slide 8 – Live Demo (two screenshots side‑by‑side)
let s8 = pptx.addSlide();
s8.addText("Live Demo – UI Walkthrough", {
  x: 0.5, y: 0.5, w: 9, h: 0.8,
  fontSize: 30, bold: true, color: "0F172A"
});
s8.addImage({ path: imgDashboard, x: 0.5, y: 1.4, w: 4.3, h: 3.5 });
s8.addImage({ path: imgEpisode,   x: 5.2, y: 1.4, w: 4.3, h: 3.5 });

// ---------------------------------------------------
// Slide 9 – Q&A
let s9 = pptx.addSlide();
s9.addText("Questions?", {
  x: 1, y: 2.2, w: 8, h: 1.2,
  fontSize: 48, bold: true, color: "0F172A", align: "center"
});
s9.addText("Thank you for your time.", {
  x: 1, y: 3.8, w: 8, h: 0.8,
  fontSize: 24, color: "64748B", align: "center"
});

// Save the polished presentation
pptx.writeFile({ fileName: "Med-Track_Presentation_Polished.pptx" })
  .then(name => console.log("Created: " + name));
