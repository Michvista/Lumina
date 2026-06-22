import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import { useSession } from '../hooks/useSession';
import { uploadReport } from '../lib/api';

type CyclePhase = 'follicular' | 'ovulatory' | 'luteal' | 'menstrual' | 'not_applicable' | 'menopausal' | 'unknown';

export default function Upload() {
  const { sessionId, ready } = useSession();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [cycleDay, setCycleDay] = useState<string>('');
  const [cyclePhase, setCyclePhase] = useState<CyclePhase>('unknown');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select or drop a lab report file first.');
      return;
    }
    if (!sessionId) return;
    setLoading(true);
    setError(null);

    // Auto-map cycle day to basic phase if not set
    let activePhase = cyclePhase;
    if (cycleDay) {
      const day = parseInt(cycleDay, 10);
      if (day >= 1 && day <= 5) activePhase = 'menstrual';
      else if (day >= 6 && day <= 13) activePhase = 'follicular';
      else if (day >= 14 && day <= 16) activePhase = 'ovulatory';
      else if (day >= 17 && day <= 35) activePhase = 'luteal';
    }

    try {
      const { reportId } = await uploadReport(
        file,
        sessionId,
        cycleDay ? parseInt(cycleDay, 10) : null,
        activePhase,
      );
      navigate(`/results/${reportId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF6F2] min-h-screen text-[#2A1A24] py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Page Header */}
        <div className="text-center max-w-xl mx-auto space-y-4 animate-fade-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8FA998]/10 text-[#586E5E] text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={12} />
            AI-Powered Lab Decoder
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-[#5D3754]">Decode your report</h1>
          <p className="font-sans text-sm text-[#5D3754]/80 leading-relaxed">
            Upload your blood work or hormone panel and let Lumina build your plain-English translations and advocacy questions.
          </p>
        </div>

        {/* Two Column Layout (Image 2 Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-up anim-delay-1">
          
          {/* Left Column: File Upload */}
          <div className="lg:col-span-7 bg-white border border-[#F4DFD7] rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-semibold text-[#5D3754]">Upload Lab Results</h2>
              <p className="text-xs text-[#5D3754]/75">We support clear photos or PDF documents of standard blood tests.</p>
            </div>

            {/* Drag and Drop Zone */}
            <div className="border-2 border-dashed border-[#F4DFD7] hover:border-[#5D3754] rounded-2xl p-8 bg-[#FAF6F2]/30 transition-all duration-300">
              <FileUpload
                onFileSelect={setFile}
                selectedFile={file}
                onClear={() => setFile(null)}
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-[#5D3754]/70 bg-[#FAF6F2] rounded-xl p-3 border border-[#F4DFD7]/60">
              <ShieldCheck size={16} className="text-[#8FA998] shrink-0" />
              <span>Your files are encrypted end-to-end and handled in strict HIPAA-compliant security.</span>
            </div>
          </div>

          {/* Right Column: Cycle Context & Generator */}
          <div className="lg:col-span-5 bg-white border border-[#F4DFD7] rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-semibold text-[#5D3754]">Phase-Aware Context</h2>
              <p className="text-xs text-[#5D3754]/75">Blood markers fluctuate. Tell us about your cycle for a personalized interpretation.</p>
            </div>

            {/* Cycle day form (Simpler English as requested) */}
            <div className="space-y-4 font-sans">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#5D3754]/85 uppercase tracking-wide" htmlFor="cycle-day-select">
                  Days since the first day of your last period
                </label>
                <div className="relative">
                  <select
                    id="cycle-day-select"
                    className="w-full bg-[#FAF6F2] border border-[#F4DFD7] rounded-xl px-4 py-3.5 text-sm text-[#5D3754] focus:outline-none focus:ring-1 focus:ring-[#5D3754] appearance-none cursor-pointer"
                    value={cycleDay}
                    onChange={(e) => {
                      setCycleDay(e.target.value);
                      if (e.target.value === 'not_cycling') {
                        setCyclePhase('not_applicable');
                      } else if (e.target.value === 'menopausal') {
                        setCyclePhase('menopausal');
                      } else if (e.target.value === '') {
                        setCyclePhase('unknown');
                      }
                    }}
                  >
                    <option value="">I am not sure / Skip cycle tuning</option>
                    <option value="not_cycling">I am not currently cycling (Pregnancy, hormonal birth control)</option>
                    <option value="menopausal">Post-menopausal or Peri-menopausal</option>
                    <option disabled>── Select a cycle day ──</option>
                    {Array.from({ length: 35 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        Day {day} {day === 1 ? '(Period starts)' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#5D3754]">
                    ▼
                  </div>
                </div>
              </div>

              {/* Callout information box */}
              <div className="flex gap-2.5 bg-[#8FA998]/10 border border-[#8FA998]/20 rounded-xl p-4 text-xs text-[#586E5E]">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Cycle day context helps us differentiate between standard ranges and your <strong>optimal</strong> healthy range.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Generate Report CTA */}
            <button
              className="w-full font-sans text-sm font-semibold bg-[#5D3754] hover:bg-[#4C2C44] text-[#FAF6F2] disabled:opacity-50 disabled:pointer-events-none py-4 rounded-full shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              disabled={loading || !ready}
              onClick={handleUpload}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Decoding & Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Report
                </>
              )}
            </button>
          </div>

        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-[#5D3754]/60 max-w-xl mx-auto leading-relaxed">
          Lumina is an educational tool and does not replace medical advice. Always review generated interpretations and lab results with a qualified healthcare professional.
        </p>

      </div>
    </div>
  );
}
