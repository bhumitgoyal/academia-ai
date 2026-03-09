import { useEffect, useRef, useState } from 'react'

let mermaidLoaded = false
let mermaidInstance = null

async function getMermaid() {
  if (!mermaidInstance) {
    const m = await import('mermaid')
    mermaidInstance = m.default
    mermaidInstance.initialize({
      startOnLoad: false,
      theme: 'default',
      flowchart: { htmlLabels: true, curve: 'basis' },
      sequence: { diagramMarginX: 50 },
    })
    mermaidLoaded = true
  }
  return mermaidInstance
}

export default function PrintableUMLDiagram({ diagram, index }) {
  const [svgContent, setSvgContent] = useState('')
  const [error, setError] = useState('')
  const code = diagram.mermaid_code || ''

  const render = async (src) => {
    try {
      const m = await getMermaid()
      // Generate a unique ID to prevent conflicts when printing multiple diagrams
      const id = `print-mermaid-${index}-${Math.random().toString(36).substr(2, 9)}`
      const { svg } = await m.render(id, src)
      setSvgContent(svg)
      setError('')
    } catch (err) {
      setError(err.message || 'Diagram render error')
      console.error("Mermaid Render Error:", err)
    }
  }

  useEffect(() => { 
    if (code) {
        render(code) 
    }
  }, [code])

  const typeLabel = {
    class: 'Class Diagram',
    sequence: 'Sequence Diagram',
    flowchart: 'Flowchart',
    er: 'ER Diagram',
    activity: 'Activity Diagram',
    usecase: 'Use Case',
    stateDiagram: 'State Diagram',
  }[diagram.diagram_type] || diagram.diagram_type

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white mb-6 html2pdf__page-break">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">{diagram.title || typeLabel}</span>
        <span className="text-xs text-gray-500 uppercase tracking-wider">{typeLabel}</span>
      </div>

      <div className="p-4 flex justify-center">
        {error ? (
          <div className="text-red-600 border border-red-200 bg-red-50 p-3 rounded w-full">
            <p className="font-semibold mb-1">Diagram Syntax Error:</p>
            <p className="font-mono whitespace-pre-wrap">{error}</p>
          </div>
        ) : svgContent ? (
          <div
            className="mermaid-container w-full flex justify-center overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="flex items-center justify-center p-8 text-gray-400 italic">
            Rendering diagram...
          </div>
        )}
      </div>
    </div>
  )
}
