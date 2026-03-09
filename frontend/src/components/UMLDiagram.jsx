import { useEffect, useRef, useState } from 'react'
import { GitBranch, Edit3, Eye } from 'lucide-react'

let mermaidLoaded = false
let mermaidInstance = null

async function getMermaid() {
  if (!mermaidInstance) {
    const m = await import('mermaid')
    mermaidInstance = m.default
    mermaidInstance.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#1a1a26',
        primaryTextColor: '#e8e8f0',
        primaryBorderColor: '#d4a843',
        lineColor: '#d4a843',
        secondaryColor: '#252535',
        tertiaryColor: '#363650',
        background: '#0a0a0f',
        mainBkg: '#1a1a26',
        nodeBorder: '#d4a843',
        clusterBkg: '#252535',
        titleColor: '#d4a843',
        edgeLabelBackground: '#252535',
        actorBorder: '#d4a843',
        actorBkg: '#1a1a26',
        actorTextColor: '#e8e8f0',
        signalColor: '#d4a843',
        signalTextColor: '#e8e8f0',
      },
      flowchart: { htmlLabels: true, curve: 'basis' },
      sequence: { diagramMarginX: 50 },
    })
    mermaidLoaded = true
  }
  return mermaidInstance
}

export default function UMLDiagram({ diagram, index }) {
  const ref = useRef()
  const [svgContent, setSvgContent] = useState('')
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [code, setCode] = useState(diagram.mermaid_code || '')

  const render = async (src) => {
    try {
      const m = await getMermaid()
      const id = `mermaid-${index}-${Date.now()}`
      const { svg } = await m.render(id, src)
      setSvgContent(svg)
      setError('')
    } catch (err) {
      setError(err.message || 'Diagram render error')
    }
  }

  useEffect(() => { render(code) }, [])

  const handleApply = () => {
    render(code)
    setEditMode(false)
  }

  const typeLabel = {
    class: '📦 Class Diagram',
    sequence: '🔄 Sequence Diagram',
    flowchart: '🔀 Flowchart',
    er: '🗃️ ER Diagram',
    activity: '⚡ Activity Diagram',
    usecase: '👤 Use Case',
    stateDiagram: '🔵 State Diagram',
  }[diagram.diagram_type] || `📊 ${diagram.diagram_type}`

  return (
    <div className="rounded-xl border border-ink-600 overflow-hidden bg-ink-900">
      <div className="flex items-center justify-between px-4 py-3 bg-ink-800 border-b border-ink-700">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-gold-400" />
          <span className="text-sm font-semibold text-parchment-100">{diagram.title || typeLabel}</span>
          <span className="text-xs text-gray-500 bg-ink-700 px-2 py-0.5 rounded">{typeLabel}</span>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-gold-500/10"
        >
          {editMode ? <><Eye className="w-3.5 h-3.5" />Preview</> : <><Edit3 className="w-3.5 h-3.5" />Edit</>}
        </button>
      </div>

      {editMode ? (
        <div className="p-4 space-y-3">
          <textarea
            className="input-field font-mono text-sm resize-none"
            rows={10}
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Mermaid diagram syntax..."
          />
          <button onClick={handleApply} className="btn-primary text-sm py-2 px-4">
            Apply & Render
          </button>
        </div>
      ) : (
        <div className="p-6">
          {error ? (
            <div className="text-red-400 text-sm bg-red-500/10 p-4 rounded-lg border border-red-500/20">
              <p className="font-semibold mb-1">Diagram render error:</p>
              <p className="font-mono text-xs">{error}</p>
            </div>
          ) : svgContent ? (
            <div
              className="mermaid-container flex justify-center overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-600 text-sm">
              Rendering diagram...
            </div>
          )}
        </div>
      )}

      {diagram.description && (
        <div className="px-5 py-3 border-t border-ink-700 bg-ink-800/50">
          <p className="text-xs text-gray-400 italic">{diagram.description}</p>
        </div>
      )}
    </div>
  )
}
