import { Heart, Activity, Clock, FileText, ChevronRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-vibrant-purple/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-vibrant-pink/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-[500px] h-[500px] bg-brand-300/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 py-12 md:py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center min-h-[80vh]">
          
          {/* Left Column: Bold Typography & CTA */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
              <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-ping"></span>
              <span className="text-sm font-semibold text-slate-700 tracking-wide uppercase">The Future of Health Tracking</span>
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Know <br className="hidden lg:block" />
              <span className="text-gradient">Your Body.</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-600 mb-10 max-w-lg leading-relaxed font-light">
              Ditch the generic notebooks. Track symptoms, medications, and visits using a beautiful, intelligent timeline.
            </p>

            <button
              onClick={() => navigate("/signup")}
              className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-full bg-slate-900 px-10 font-medium text-neutral-50 transition-all duration-300 hover:scale-105 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:transition-all group-hover:duration-700 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                <div className="relative h-full w-8 bg-white/20" />
              </div>
              <span className="text-lg font-semibold flex items-center gap-2">
                Get Started Free <ChevronRight className="h-5 w-5" />
              </span>
            </button>
            <div className="mt-8 flex items-center gap-4 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-vibrant-purple/20 border-2 border-slate-50 flex items-center justify-center"><Heart className="w-4 h-4 text-vibrant-purple" /></div>
                <div className="w-8 h-8 rounded-full bg-brand-500/20 border-2 border-slate-50 flex items-center justify-center"><Activity className="w-4 h-4 text-brand-500" /></div>
                <div className="w-8 h-8 rounded-full bg-vibrant-pink/20 border-2 border-slate-50 flex items-center justify-center"><Zap className="w-4 h-4 text-vibrant-pink" /></div>
              </div>
              <span>Join thousands tracking smarter.</span>
            </div>
          </div>

          {/* Right Column: dynamic Bento Box grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/20 blur-[100px] -z-10 rounded-full"></div>
            
            {/* Bento Top Left */}
            <div className="glass-card rounded-[2rem] p-8 sm:mt-12 group hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mb-6 shadow-lg shadow-brand-500/30 group-hover:scale-110 transition-transform">
                <Activity className="h-7 w-7 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Live Episodes</h3>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">
                Log active conditions dynamically with ongoing updates and progress.
              </p>
            </div>

            {/* Bento Top Right - Taller */}
            <div className="glass-card rounded-[2rem] p-8 sm:-mt-8 flex flex-col justify-between group hover:-translate-y-2">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-vibrant-purple to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-vibrant-purple/30 group-hover:scale-110 transition-transform">
                  <Clock className="h-7 w-7 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Health Timeline</h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed mb-6">
                  Every medication, symptom, and doctor visit securely stored on a beautiful chronological timeline.
                </p>
              </div>
              <div className="w-full h-24 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl border border-slate-200 shrink-0 relative overflow-hidden">
                 <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-300 -translate-y-1/2"></div>
                 <div className="absolute top-1/2 left-8 w-3 h-3 rounded-full bg-brand-500 -translate-y-1/2 ring-4 ring-white"></div>
                 <div className="absolute top-1/2 left-20 w-3 h-3 rounded-full bg-vibrant-purple -translate-y-1/2 ring-4 ring-white"></div>
              </div>
            </div>

            {/* Bento Bottom (Spans 2 cols on mobile, 1 on sm) */}
            <div className="glass-card rounded-[2rem] p-8 sm:col-span-2 group hover:-translate-y-2 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 shrink-0 rounded-full bg-gradient-to-br from-vibrant-pink to-rose-500 flex items-center justify-center shadow-lg shadow-vibrant-pink/30 group-hover:rotate-12 transition-transform">
                <FileText className="h-8 w-8 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Beautiful PDF Exports</h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">
                  Generate comprehensive, clean, and professional PDF reports for your healthcare providers instantly.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}