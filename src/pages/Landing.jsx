import { Heart, Activity, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#f9fafb]">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-20 md:pt-32 md:pb-28">
        
        {/* App Icon */}
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22c55e] to-[#3b82f6] shadow-lg">
          <Heart className="h-12 w-12 text-white" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
          Med Track
        </h1>

        {/* Tagline */}
        <p className="mb-4 text-center text-xl text-gray-800 md:text-2xl">
          Track your health. Understand your body.
        </p>

        {/* Description */}
        <p className="mb-10 max-w-xl text-center leading-relaxed text-gray-600">
          Store symptoms, medicines, and doctor visits in one place. Keep a complete timeline of your health journey.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/signup")}
          className="h-12 rounded-full bg-gradient-to-r from-[#22c55e] to-[#3b82f6] px-10 text-base font-medium text-white shadow-md transition hover:shadow-lg hover:brightness-105"
        >
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className="px-4 pb-24 md:pb-32">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3 md:gap-8">
          
          <FeatureCard
            icon={<Activity className="h-6 w-6 text-emerald-600" strokeWidth={1.5} />}
            iconBgColor="bg-emerald-100"
            title="Track Episodes"
            description="Log health episodes with symptoms and medications. Continue updating as your condition changes."
          />

          <FeatureCard
            icon={<Clock className="h-6 w-6 text-sky-600" strokeWidth={1.5} />}
            iconBgColor="bg-sky-100"
            title="Complete Timeline"
            description="View your health history chronologically. Every update is preserved, never overwritten."
          />

          <FeatureCard
            icon={<FileText className="h-6 w-6 text-violet-500" strokeWidth={1.5} />}
            iconBgColor="bg-violet-100"
            title="Export Reports"
            description="Download complete health reports as PDF to share with doctors or keep for your records."
          />

        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, iconBgColor, title, description }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
      <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${iconBgColor}`}>
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}