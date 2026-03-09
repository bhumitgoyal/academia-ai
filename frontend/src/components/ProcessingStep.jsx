import { useEffect, useState } from 'react'
import { Brain, FileSearch, Code2, GitBranch, FileOutput } from 'lucide-react'

const STAGES = [
  { icon: FileSearch, label: 'Parsing assessment document', duration: 2000 },
  { icon: Brain, label: 'Extracting questions and metadata', duration: 2500 },
  { icon: Brain, label: 'Generating comprehensive answers', duration: 4000 },
  { icon: Code2, label: 'Compiling code solutions', duration: 2000 },
  { icon: GitBranch, label: 'Building UML diagrams', duration: 1500 },
  { icon: FileOutput, label: 'Assembling LaTeX document', duration: 1500 },
]

export default function ProcessingStep() {
  const [currentStage, setCurrentStage] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 100), 100)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    let t = 0
    STAGES.forEach((stage, i) => {
      setTimeout(() => setCurrentStage(i), t)
      t += stage.duration
    })
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 animate-fade-up">

      {/* Animated orb */}
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 bg-gold-500/20 rounded-full animate-pulse-slow" />
        <div className="absolute inset-3 bg-gold-500/10 rounded-full border border-gold-500/30 animate-spin-slow" style={{ animationDuration: '4s' }} />
        <div className="absolute inset-6 bg-ink-900 rounded-full border border-gold-500/20 flex items-center justify-center">
          {(() => {
            const Icon = STAGES[currentStage]?.icon || Brain
            return <Icon className="w-8 h-8 text-gold-400 animate-pulse" />
          })()}
        </div>
      </div>

      {/* Stage list */}
      <div className="w-full max-w-md space-y-3">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon
          const done = i < currentStage
          const active = i === currentStage
          return (
            <div key={i} className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-500 ${active ? 'glass gold-border' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500/20' : active ? 'bg-gold-500/20' : 'bg-ink-700'}`}>
                {done ? (
                  <span className="text-green-400 text-sm">✓</span>
                ) : (
                  <Icon className={`w-4 h-4 ${active ? 'text-gold-400' : 'text-gray-600'}`} />
                )}
              </div>
              <span className={`text-sm font-body ${active ? 'text-parchment-100' : done ? 'text-green-400/70' : 'text-gray-600'}`}>
                {stage.label}
                {active && <span className="text-gold-400 animate-pulse">...</span>}
              </span>
            </div>
          )
        })}
      </div>

      <div className="text-center space-y-1">
        <p className="text-gray-400 text-sm font-body">{(elapsed / 1000).toFixed(1)}s elapsed</p>
        <p className="text-gray-600 text-xs">This may take 30–60 seconds for complex assessments</p>
      </div>
    </div>
  )
}
