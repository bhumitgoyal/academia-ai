import { useState } from 'react'
import { FileText, Code2, GitBranch, FileCode, BarChart3, RefreshCw, Loader2 } from 'lucide-react'
import AnswerSheetPreview from './AnswerSheetPreview'
import Terminal from './Terminal'
import UMLDiagram from './UMLDiagram'
import LaTeXViewer from './LaTeXViewer'

const TABS = [
  { id: 'preview', label: 'Answer Sheet', icon: FileText },
  { id: 'code', label: 'Code & Terminal', icon: Code2 },
  { id: 'diagrams', label: 'UML Diagrams', icon: GitBranch },
  { id: 'latex', label: 'LaTeX Source', icon: FileCode },
  { id: 'summary', label: 'Summary', icon: BarChart3 },
]

export default function OutputView({ result, setResult, onReset, formData }) {
  const [activeTab, setActiveTab] = useState('preview')
  const [regenerating, setRegenerating] = useState(null)
  const [toneMap, setToneMap] = useState({})

  const { metadata, questions, summary, latex_full_document } = result

  // Collect all code snippets across all questions
  const allCodeSnippets = questions?.flatMap((q, qi) =>
    (q.answer?.code_snippets || []).map(s => ({ ...s, qNum: q.q_number, qIdx: qi }))
  ) || []

  // Collect all UML diagrams
  const allDiagrams = questions?.flatMap((q, qi) =>
    (q.answer?.uml_diagrams || []).map((d, di) => ({ ...d, qNum: q.q_number, idx: qi * 10 + di }))
  ) || []

  const regenerateAnswer = async (question, qi) => {
    setRegenerating(qi)
    try {
      const fd = new FormData()
      fd.append('question', question.q_text)
      fd.append('subject', metadata.subject_name || '')
      fd.append('tone', toneMap[qi] || 'standard')
      fd.append('student_name', metadata.student_name)
      fd.append('registration_number', metadata.registration_number)

      const resp = await fetch('/api/regenerate-answer', { method: 'POST', body: fd })
      if (!resp.ok) throw new Error('Regeneration failed')
      const newAnswer = await resp.json()

      // Update result immutably via parent setter
      setResult(prev => {
        const updated = { ...prev, questions: [...prev.questions] }
        updated.questions[qi] = { ...updated.questions[qi], answer: newAnswer }
        return updated
      })
    } catch (err) {
      console.error('Regeneration failed:', err)
    } finally {
      setRegenerating(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Metadata banner */}
      <div className="glass rounded-2xl p-5 gold-border gold-glow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-widest">Generated Answer Sheet</p>
            <h2 className="font-display text-xl font-bold text-parchment-50">
              {metadata.subject_name || 'Assessment'} <span className="text-gold-400">({metadata.subject_code})</span>
            </h2>
            <p className="text-sm text-gray-400">
              {metadata.student_name} · <span className="font-mono text-gold-500/80">{metadata.registration_number}</span>
              {metadata.semester && ` · ${metadata.semester}`}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {summary?.total_questions && (
              <div className="text-center px-4 py-2 bg-ink-800 border border-ink-600 rounded-xl">
                <p className="text-gold-400 font-bold text-xl">{summary.total_questions}</p>
                <p className="text-gray-500 text-xs">Questions</p>
              </div>
            )}
            {allDiagrams.length > 0 && (
              <div className="text-center px-4 py-2 bg-ink-800 border border-ink-600 rounded-xl">
                <p className="text-gold-400 font-bold text-xl">{allDiagrams.length}</p>
                <p className="text-gray-500 text-xs">UML Diagrams</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-ink-700">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon
            const count = tab.id === 'code' ? allCodeSnippets.length
              : tab.id === 'diagrams' ? allDiagrams.length
              : null
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-body whitespace-nowrap transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-gold-400 text-gold-400 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-gold-500/20 text-gold-400' : 'bg-ink-700 text-gray-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'preview' && <AnswerSheetPreview result={result} formData={formData} />}

        {activeTab === 'code' && (
          <div className="space-y-8">
            {allCodeSnippets.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <Code2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No code snippets generated for this assessment.</p>
              </div>
            ) : (
              questions?.map((q, qi) => (
                q.answer?.code_snippets?.length > 0 && (
                  <div key={qi} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-gold-500/10 border border-gold-500/30 rounded-lg text-gold-400 text-sm font-bold flex items-center justify-center">
                        {q.q_number}
                      </span>
                      <p className="text-sm text-gray-400 flex-1 truncate">{q.q_text?.substring(0, 80)}...</p>
                    </div>
                    {q.answer.code_snippets.map((snippet, si) => (
                      <Terminal key={si} snippet={snippet} questionNumber={q.q_number} />
                    ))}
                  </div>
                )
              ))
            )}
          </div>
        )}

        {activeTab === 'diagrams' && (
          <div className="space-y-8">
            {allDiagrams.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No UML diagrams generated for this assessment.</p>
              </div>
            ) : (
              questions?.map((q, qi) => (
                q.answer?.uml_diagrams?.length > 0 && (
                  <div key={qi} className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-ink-700">
                      <span className="w-8 h-8 bg-gold-500/10 border border-gold-500/30 rounded-lg text-gold-400 text-sm font-bold flex items-center justify-center">
                        {q.q_number}
                      </span>
                      <p className="text-sm text-gray-400">{q.q_text?.substring(0, 100)}...</p>
                    </div>
                    {q.answer.uml_diagrams.map((diagram, di) => (
                      <UMLDiagram key={di} diagram={diagram} index={qi * 10 + di} />
                    ))}
                  </div>
                )
              ))
            )}
          </div>
        )}

        {activeTab === 'latex' && (
          <LaTeXViewer latex={latex_full_document || '% No LaTeX generated'} />
        )}

        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Topics covered */}
            {summary?.topics_covered?.length > 0 && (
              <div className="glass rounded-2xl p-6 gold-border">
                <h3 className="font-display text-lg font-semibold text-parchment-100 mb-4">Topics Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {summary.topics_covered.map((t, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gold-500/10 border border-gold-500/20 rounded-full text-gold-300 text-sm">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Per-question breakdown */}
            <div className="glass rounded-2xl p-6 gold-border">
              <h3 className="font-display text-lg font-semibold text-parchment-100 mb-4">Question Breakdown</h3>
              <div className="space-y-3">
                {questions?.map((q, qi) => (
                  <div key={qi} className="flex items-center gap-4 p-3 rounded-xl bg-ink-800/50 border border-ink-700">
                    <span className="w-8 h-8 flex items-center justify-center text-gold-400 font-bold text-sm flex-shrink-0 border border-gold-500/20 rounded-lg">
                      {q.q_number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-parchment-100 truncate">{q.q_text?.substring(0, 70)}...</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          q.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                          q.difficulty === 'hard' ? 'bg-red-500/10 text-red-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}>{q.difficulty}</span>
                        <span className="text-xs text-gray-500 capitalize">{q.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Regenerate controls */}
                      <select
                        className="text-xs bg-ink-700 border border-ink-600 rounded px-2 py-1 text-gray-400"
                        value={toneMap[qi] || 'standard'}
                        onChange={e => setToneMap(prev => ({ ...prev, [qi]: e.target.value }))}
                      >
                        <option value="brief">Brief</option>
                        <option value="standard">Standard</option>
                        <option value="detailed">Detailed</option>
                      </select>
                      <button
                        onClick={() => regenerateAnswer(q, qi)}
                        disabled={regenerating === qi}
                        className="flex items-center gap-1.5 text-xs text-gold-400 border border-gold-500/30 px-3 py-1.5 rounded-lg hover:bg-gold-500/10 transition-all disabled:opacity-50"
                      >
                        {regenerating === qi ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        Regen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty distribution */}
            {summary?.difficulty_distribution && Object.values(summary.difficulty_distribution).some(v => v > 0) && (
              <div className="glass rounded-2xl p-6 gold-border">
                <h3 className="font-display text-lg font-semibold text-parchment-100 mb-4">Difficulty Distribution</h3>
                <div className="flex items-end gap-4 h-24">
                  {Object.entries(summary.difficulty_distribution).map(([level, count]) => (
                    <div key={level} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-sm font-bold text-parchment-100">{count}</span>
                      <div
                        className="w-full rounded-t-lg transition-all"
                        style={{
                          height: `${(count / (summary.total_questions || 1)) * 72}px`,
                          backgroundColor: level === 'easy' ? '#22c55e30' : level === 'hard' ? '#ef444430' : '#eab30830',
                          border: `1px solid ${level === 'easy' ? '#22c55e50' : level === 'hard' ? '#ef444450' : '#eab30850'}`
                        }}
                      />
                      <span className="text-xs text-gray-500 capitalize">{level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
