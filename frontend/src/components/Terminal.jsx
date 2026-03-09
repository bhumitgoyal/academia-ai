import { useState } from 'react'
import { Play, Loader2, Copy, Check } from 'lucide-react'

const LANG_COLORS = {
  python: '#3b82f6',
  java: '#f59e0b',
  cpp: '#8b5cf6',
  c: '#6b7280',
  octave: '#10b981',
  matlab: '#10b981',
}

const LANG_LABELS = {
  python: 'Python 3.10',
  java: 'Java 15',
  cpp: 'C++ (GCC 10)',
  c: 'C (GCC 10)',
  octave: 'GNU Octave 6',
  matlab: 'Octave (MATLAB compat.)',
}

export default function Terminal({ snippet, questionNumber }) {
  const [output, setOutput] = useState(null)
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  const lang = snippet.language?.toLowerCase() || 'python'
  const color = LANG_COLORS[lang] || '#64748b'

  const runCode = async () => {
    setRunning(true)
    setOutput(null)
    try {
      const resp = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang, code: snippet.code, stdin: '' })
      })
      const data = await resp.json()
      setOutput(data)
    } catch (err) {
      setOutput({ stdout: '', stderr: `Network error: ${err.message}`, exit_code: 1 })
    } finally {
      setRunning(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(snippet.code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output.stdout || output.stderr || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="overflow-hidden border border-ink-600 bg-ink-900">
      {/* File header */}
      <div className="flex items-center justify-between px-4 py-3 bg-ink-800 border-b border-ink-700">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-mono text-sm text-parchment-100">{snippet.filename || `q${questionNumber}_solution.${lang === 'cpp' ? 'cpp' : lang === 'java' ? 'java' : lang === 'c' ? 'c' : lang === 'matlab' ? 'm' : 'py'}`}</span>
          <span className="text-xs text-gray-500 px-2 py-0.5 rounded bg-ink-700">{LANG_LABELS[lang] || lang}</span>
        </div>
        <div className="flex items-center gap-2">
          {snippet.install_command && (
            <span className="text-xs text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded">
              {snippet.install_command}
            </span>
          )}
          <button onClick={copyCode} className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors">
            {codeCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Code block */}
      <pre className="p-5 overflow-x-auto text-sm leading-relaxed text-gray-300 font-mono max-h-80 overflow-y-auto">
        <code>{snippet.code}</code>
      </pre>

      {/* Run button */}
      <div className="px-4 py-3 bg-ink-800/50 border-t border-ink-700 flex items-center justify-between">
        <button
          onClick={runCode}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all"
          style={{
            backgroundColor: running ? '#1f2937' : `${color}20`,
            color: running ? '#6b7280' : color,
            border: `1px solid ${running ? '#374151' : color + '40'}`,
          }}
        >
          {running ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" />Executing via Piston...</>
          ) : (
            <><Play className="w-3.5 h-3.5" />Run Code</>
          )}
        </button>
        {output && (
          <span className={`text-xs px-2 py-1 rounded ${output.exit_code === 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            Exit {output.exit_code} · {output.simulated ? 'simulated' : 'live'}
          </span>
        )}
      </div>

      {/* Terminal output */}
      {output && (
        <div className="bg-black border-t border-ink-600 relative group">
          <button onClick={copyOutput} className="absolute right-4 top-4 text-gray-500 hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <div className="p-5 font-mono text-sm leading-relaxed text-gray-300 overflow-x-auto">
            <div className="text-white mb-2">
              <span className="text-white">user@MacBook-Pro ~ % </span>
              {lang === 'python' && <span>python {snippet.filename || 'solution.py'}</span>}
              {(lang === 'cpp' || lang === 'c') && (
                <span>g++ -o solution {snippet.filename || 'solution.cpp'} && ./solution</span>
              )}
              {lang === 'java' && (
                <span>javac {snippet.filename || 'Solution.java'} && java {(snippet.filename || 'Solution.java').replace('.java','')}</span>
              )}
              {lang === 'octave' && <span>octave {snippet.filename || 'script.m'}</span>}
            </div>
            
            {output.stdout && <span className="text-gray-200 whitespace-pre-wrap">{output.stdout}</span>}
            {output.stderr && <span className="text-red-400 whitespace-pre-wrap">{output.stderr}</span>}
            {!output.stdout && !output.stderr && (
              <span className="text-gray-500 italic">(no output)</span>
            )}
            
            <div className="text-white mt-3">
              user@MacBook-Pro ~ % <span className="w-2.5 h-4 bg-white inline-block align-middle ml-1 animate-pulse"></span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
