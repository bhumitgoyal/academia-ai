import { GraduationCap, RotateCcw } from 'lucide-react'

export default function Header({ step, onReset }) {
  return (
    <header className="border-b border-gold-500/10 mb-12">
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/30 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-parchment-50 tracking-tight">
              Academia<span className="text-gold-400">AI</span>
            </h1>
            <p className="text-xs text-gray-500 font-body">Assessment Answer Generator</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-body">
          {['intake', 'processing', 'output'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                s === step
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                  : i < ['intake','processing','output'].indexOf(step)
                  ? 'text-green-400/70'
                  : 'text-gray-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s === step ? 'bg-gold-400' : i < ['intake','processing','output'].indexOf(step) ? 'bg-green-400' : 'bg-gray-600'}`} />
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </div>
              {i < 2 && <span className="text-gray-700">›</span>}
            </div>
          ))}
        </div>

        {step === 'output' && (
          <button onClick={onReset} className="btn-ghost flex items-center gap-2 text-sm">
            <RotateCcw className="w-4 h-4" />
            New Assessment
          </button>
        )}
      </div>
    </header>
  )
}
