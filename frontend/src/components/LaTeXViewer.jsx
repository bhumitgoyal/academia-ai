import { useState } from 'react'
import { Copy, Check, Download, FileText, Loader2 } from 'lucide-react'

export default function LaTeXViewer({ latex }) {
  const [copied, setCopied] = useState(false)
  const [isCompiling, setIsCompiling] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(latex)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadTex = () => {
    const blob = new Blob([latex], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'assessment_answers.tex'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPdf = async () => {
    setIsCompiling(true)
    try {
      const resp = await fetch('https://latex.ytotech.com/builds/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf'
        },
        body: JSON.stringify({
          compiler: 'pdflatex',
          resources: [{ main: true, content: latex }]
        })
      })
      if (!resp.ok) throw new Error('Failed to compile PDF')
      
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'assessment_answers.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch(err) {
      console.error(err)
      alert("Failed to compile LaTeX to PDF via ytotech API.")
    } finally {
      setIsCompiling(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-display text-lg font-semibold text-parchment-100">LaTeX Source</h3>
          <p className="text-sm text-gray-500">Fully compilable on Overleaf or local TeX distribution</p>
        </div>
        <div className="flex gap-2">
          <button onClick={copy} className="btn-ghost flex items-center gap-2 text-sm">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={downloadTex} className="btn-secondary flex items-center gap-2 text-sm py-2 px-3 border border-ink-600 rounded-lg hover:bg-ink-700 transition-colors text-white">
            <FileText className="w-4 h-4" />
            Download .tex
          </button>
          <button onClick={downloadPdf} disabled={isCompiling} className="btn-primary flex items-center gap-2 text-sm py-2 disabled:opacity-50">
            {isCompiling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isCompiling ? 'Compiling...' : 'Download PDF'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-ink-600 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-ink-800 border-b border-ink-700">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="font-mono text-sm text-gray-400">assessment_answers.tex</span>
          <span className="text-xs text-gray-600 ml-auto">{latex.length} chars</span>
        </div>
        <pre className="p-5 overflow-auto max-h-[600px] text-sm text-gray-300 font-mono leading-relaxed bg-ink-900 whitespace-pre-wrap break-words">
          {latex}
        </pre>
      </div>

      <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
        <p className="text-sm text-blue-300 font-semibold mb-1">💡 Compiling with Overleaf (recommended)</p>
        <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
          <li>Download the .tex file above</li>
          <li>Go to <span className="text-blue-400">overleaf.com</span> → New Project → Upload Project</li>
          <li>Upload the .tex file and compile with pdfLaTeX</li>
        </ol>
      </div>
    </div>
  )
}
