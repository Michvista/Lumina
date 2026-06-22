import { Link } from 'react-router-dom';
import { Shield, Sparkles, Upload, FileText, Check } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-[#FAF6F2] min-h-screen text-[#2A1A24] selection:bg-[#F4DFD7] selection:text-[#5D3754]">

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 md:space-y-8 animate-fade-up">

            {/* Trusted Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4DFD7] text-[#5D3754] text-xs font-semibold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5D3754] animate-ping" />
              Trusted by 50k+ Women
            </div>

            {/* Title */}
            <h1 className="font-serif text-5xl md:text-7xl font-semibold leading-[1.1] text-[#5D3754]">
              Stop Googling your lab results. <span className="italic font-normal">Understand</span> your body.
            </h1>

            {/* Subtitle */}
            <p className="font-sans text-lg md:text-xl text-[#5D3754]/85 max-w-xl leading-relaxed">
              Lumina translates your blood work, hormone panels, and ultrasound reports into empathetic, plain-language insights tailored for women's health.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/upload"
                className="inline-flex items-center justify-center gap-2 bg-[#5D3754] hover:bg-[#4C2C44] text-[#FAF6F2] font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-center"
              >
                <Upload size={18} />
                Upload Your First Report - Free
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 border border-[#5D3754] text-[#5D3754] hover:bg-[#5D3754]/5 font-semibold px-8 py-4 rounded-full transition-all duration-300 text-center"
              >
                Watch how it works
              </a>
            </div>

            {/* Medical Disclaimer */}
            <p className="flex items-center gap-1.5 text-xs text-[#5D3754]/65">
              <Shield size={13} className="text-[#8FA998]" />
              For educational purposes only. Always consult your healthcare provider.
            </p>
          </div>

          {/* Right Image/Mockup Column */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end animate-fade-up anim-delay-2">
            <div className="relative w-full max-w-[460px] aspect-[4/5] rounded-[36px] overflow-hidden shadow-2xl border border-[#F4DFD7]/80 bg-white">
              {/* Photo of woman holding tablet */}
              <img
                src="/hero-woman.png"
                alt="Woman reviewing health insights"
                className="w-full h-full object-cover"
              />

              {/* Overlay card: Insight Generated */}
              <div className="absolute bottom-6 left-6 right-6 bg-[#FDFBFA]/95 backdrop-blur border border-[#F4DFD7] rounded-2xl p-4 shadow-xl flex items-start gap-3.5 animate-scale-up anim-delay-4">
                <div className="w-10 h-10 rounded-xl bg-[#8FA998]/15 flex items-center justify-center text-[#8FA998] shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <span className="block text-[11px] font-bold tracking-wider uppercase text-[#8FA998]">Insight Generated</span>
                  <p className="text-xs text-[#5D3754]/90 font-sans mt-0.5 leading-relaxed">
                    "Your ferritin levels are slightly low for your cycle phase. This might explain the mid-afternoon fatigue you noted."
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative background blobs */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#F4DFD7]/40 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-[#8FA998]/20 rounded-full blur-3xl -z-10" />
          </div>

        </div>
      </section>

      {/* ── SECTION: EMPATHETIC CLARITY ─────────────────────────── */}
      <section className="bg-white border-y border-[#F4DFD7]/50 py-16 md:py-24 px-4 md:px-6 relative" id="how-it-works">
        <div className="max-w-7xl mx-auto">

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-[#8FA998] font-bold text-xs uppercase tracking-wider block">Empathetic Clarity, Not Cold Data</span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#5D3754]">
              We don't just give you numbers.
            </h2>
            <p className="font-sans text-base md:text-lg text-[#5D3754]/85 leading-relaxed">
              We provide the context and plain-language insights you need to advocate for your health in the clinic.
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

            {/* Card 1: The Don't Panic Protocol */}
            <div className="col-span-1 md:col-span-8 bg-[#FAF6F2] border border-[#F4DFD7]/80 rounded-[28px] p-7 md:p-8 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#8FA998] uppercase tracking-wider">Personalized Context</span>
                <h3 className="font-serif text-3xl font-semibold text-[#5D3754]">The "Don't Panic" Protocol</h3>
                <p className="text-sm text-[#5D3754]/85 max-w-2xl leading-relaxed">
                  Received a result flagged as "High" or "Low"? Lumina immediately cross-references clinical benchmarks with your personal health history to explain what that actually means for you, reducing anxiety before your follow-up appointment.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 border-t border-[#F4DFD7]/40 pt-6">
                <div className="flex items-center gap-2 text-sm text-[#5D3754] font-medium">
                  <div className="w-5 h-5 rounded-full bg-[#8FA998]/15 flex items-center justify-center text-[#8FA998]">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  Immediate context for flagged results.
                </div>
                <div className="flex items-center gap-2 text-sm text-[#5D3754] font-medium">
                  <div className="w-5 h-5 rounded-full bg-[#8FA998]/15 flex items-center justify-center text-[#8FA998]">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  Explanation of clinical ranges in plain language.
                </div>
              </div>
            </div>

            {/* Card 2: Doctor Preparation */}
            <div className="col-span-1 md:col-span-4 bg-[#2E4A3F] text-white border border-[#2E4A3F]/50 rounded-[28px] p-7 md:p-8 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
              <div className="space-y-5">
                <span className="text-xs font-bold text-[#8FA998] uppercase tracking-wider block">Doctor Preparation</span>
                <h3 className="font-serif text-3xl font-semibold">Your Appointment Questions</h3>

                {/* Speech bubbles */}
                <div className="space-y-3 font-sans">
                  <div className="bg-white/10 rounded-2xl rounded-tl-none p-3.5 text-xs text-white/95 leading-relaxed">
                    <span className="block font-bold text-[10px] uppercase text-[#8FA998] mb-0.5">Example question</span>
                    "Based on my TSH levels, should we consider testing for T3 and T4 as well?"
                  </div>
                  <div className="bg-white/10 rounded-2xl rounded-tr-none p-3.5 text-xs text-white/95 leading-relaxed">
                    <span className="block font-bold text-[10px] uppercase text-[#8FA998] mb-0.5">Follow-up note</span>
                    "My low platelet count started around the same time as my fatigue. Could these be connected?"
                  </div>
                </div>
              </div>

              <p className="text-xs text-white/80 mt-6 leading-relaxed">
                Lumina generates personalized questions from your unique results — so you walk into every appointment fully prepared.
              </p>
            </div>

            {/* Card 3: Phase-Aware Analysis */}
            <div className="col-span-1 md:col-span-5 bg-[#F4DFD7] border border-[#F4DFD7] rounded-[28px] p-7 md:p-8 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center text-[#5D3754] text-xl font-bold font-serif mb-6 shadow-sm">
                ♀
              </div>
              <div className="space-y-3">
                <h3 className="font-serif text-2xl font-semibold text-[#5D3754]">Phase-Aware Analysis</h3>
                <p className="text-sm text-[#5D3754]/85 leading-relaxed">
                  Medical data isn't static. We analyze your hormone panels and blood work through the lens of your menstrual cycle, because a result that's normal in your luteal phase might be concerning in your follicular phase.
                </p>
              </div>
            </div>

            {/* Card 4: Longitudinal Memory */}
            <div className="col-span-1 md:col-span-7 bg-[#FAF6F2] border border-[#F4DFD7]/80 rounded-[28px] p-7 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between hover:shadow-lg transition-shadow duration-300">
              <div className="space-y-3 md:max-w-md">
                <h3 className="font-serif text-2xl font-semibold text-[#5D3754]">Longitudinal Memory</h3>
                <p className="text-sm text-[#5D3754]/85 leading-relaxed">
                  Stop looking at reports in isolation. Lumina tracks your results over time, revealing trends in markers like TSH, Iron, or Vitamin D that your doctor might miss in a single visit.
                </p>
              </div>
              {/* Mini Trend visual mockup */}
              <div className="w-full md:w-36 shrink-0 bg-white border border-[#F4DFD7] rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8FA998] mb-2">Trend</span>
                <div className="flex gap-2 items-end h-16 w-full px-2">
                  <div className="bg-[#5D3754]/20 w-4 rounded-t-sm h-[30%]" />
                  <div className="bg-[#5D3754]/40 w-4 rounded-t-sm h-[50%]" />
                  <div className="bg-[#5D3754]/60 w-4 rounded-t-sm h-[40%]" />
                  <div className="bg-[#5D3754] w-4 rounded-t-sm h-[85%] relative">
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-[#5D3754]">1.2</span>
                  </div>
                </div>
                <span className="text-[8px] font-semibold text-[#5D3754]/70 mt-1">Oct '24</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION: PRICING ────────────────────────────────────── */}
      <section className="py-24 px-6" id="pricing">
        <div className="max-w-5xl mx-auto">

          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#5D3754]">Clarity that fits your journey</h2>
            <p className="text-sm text-[#5D3754]/80">Explore simple pricing plans built with clear, empathetic guidance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

            {/* Single Use Card */}
            <div className="bg-white border border-[#F4DFD7] rounded-3xl p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#8FA998] uppercase tracking-wider">Single Use</span>
                  <h3 className="font-serif text-2xl font-semibold text-[#5D3754]">On-Demand Report</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-serif font-bold text-[#5D3754]">₦200</span>
                  <span className="text-sm text-[#5D3754]/75">/ report (First 3 Free)</span>
                </div>

                <div className="border-t border-[#F4DFD7]/40 my-4" />

                <ul className="space-y-3.5 text-sm text-[#5D3754]/85">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#8FA998]" /> Full plain-language breakdown
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#8FA998]" /> Custom doctor advocacy questions
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#8FA998]" /> Secure report storage
                  </li>
                </ul>
              </div>

              <Link
                to="/upload"
                className="mt-8 block text-center font-sans text-sm font-semibold border border-[#5D3754] text-[#5D3754] hover:bg-[#5D3754] hover:text-[#FAF6F2] py-3.5 rounded-full transition-colors duration-200"
              >
                Upload Now
              </Link>
            </div>

            {/* Annual Pass Card */}
            <div className="bg-[#5D3754] text-white border border-[#5D3754] rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden hover:shadow-2xl transition-all duration-300">

              {/* Highlight badge */}
              <div className="absolute top-4 right-4 bg-[#8FA998] text-[#2E4A3F] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Best Value
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#8FA998] uppercase tracking-wider">Annual Pass</span>
                  <h3 className="font-serif text-2xl font-semibold">Continuous Care</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-serif font-bold">₦5000</span>
                  <span className="text-sm text-white/75">/ year</span>
                </div>

                <div className="border-t border-white/10 my-4" />

                <ul className="space-y-3.5 text-sm text-white/90">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#8FA998]" /> Unlimited report analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#8FA998]" /> Advanced trend mapping
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#8FA998]" /> Cycle-syncing integrations
                  </li>
                </ul>
              </div>

              <Link
                to="/upload"
                className="mt-8 block text-center font-sans text-sm font-semibold bg-white text-[#5D3754] hover:bg-[#FAF6F2] py-3.5 rounded-full shadow-md transition-all duration-200"
              >
                Start 14-Day Free Trial
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION: CLOSING BANNER ──────────────────────────────── */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto bg-[#F4DFD7] rounded-[40px] p-8 md:p-16 text-center space-y-6 shadow-sm relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#8FA998]/10 rounded-full blur-xl" />

          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#5D3754] max-w-xl mx-auto leading-[1.1]">
            Your health history has a story. Let's read it together.
          </h2>
          <p className="font-sans text-[#5D3754]/95 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Join thousands of women who have found peace of mind and deeper understanding in their medical data.
          </p>

          <Link
            to="/upload"
            className="inline-flex items-center justify-center gap-2 bg-[#5D3754] hover:bg-[#4C2C44] text-[#FAF6F2] font-semibold px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            Analyze My First Report For Free
          </Link>

          <p className="text-xs text-[#5D3754]/65">
            No credit card required. HIPAA compliant & secure.
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-[#F4DFD7]/50 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-[#5D3754]">
            <div className="w-7 h-7 rounded-full bg-[#5D3754] flex items-center justify-center text-[#FAF6F2]">
              <Sparkles size={13} />
            </div>
            <span className="font-serif text-lg font-bold">Lumina</span>
          </div>
          <p className="text-xs text-[#5D3754]/65">
            © 2026 Lumina Health. Empathetic Clarity for your health journey.
          </p>
          <div className="flex gap-6 text-xs font-semibold text-[#5D3754]/75">
            <a href="#" className="hover:text-[#5D3754]">Privacy</a>
            <a href="#" className="hover:text-[#5D3754]">Terms</a>
            <a href="#" className="hover:text-[#5D3754]">Contact</a>
            <a href="#" className="hover:text-[#5D3754]">Clinical Safety</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
