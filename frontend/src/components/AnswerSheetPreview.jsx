import { useEffect, useRef, useState } from 'react'
import { Printer, Loader2 } from 'lucide-react'
import html2pdf from 'html2pdf.js'
import PrintableUMLDiagram from './PrintableUMLDiagram'

export default function AnswerSheetPreview({ result, formData }) {
  const sheetRef = useRef()
  const { metadata, questions, summary } = result

  useEffect(() => {
    // Render KaTeX after DOM is ready
    const renderMath = async () => {
      try {
        const katex = await import('katex')
        const renderMathInElement = (await import('katex/contrib/auto-render')).default
        if (sheetRef.current) {
          renderMathInElement(sheetRef.current, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\[', right: '\\]', display: true },
              { left: '\\(', right: '\\)', display: false },
            ],
            throwOnError: false,
          })
        }
      } catch (e) {
        console.warn('KaTeX render error:', e)
      }
    }
    renderMath()
  }, [result])

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const printSheet = async () => {
    if (!sheetRef.current) return
    setIsGeneratingPdf(true)
    try {
      const element = sheetRef.current
      const opt = {
        margin: [15, 15, 15, 15],
        filename: `AnswerSheet_${metadata.student_name || 'Export'}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      
      await html2pdf().from(element).set(opt).save()
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert("Failed to generate PDF. Check console for details.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const diffBadge = { easy: 'bg-green-100 text-green-800', medium: 'bg-yellow-100 text-yellow-800', hard: 'bg-red-100 text-red-800' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between no-print">
        <div>
          <h3 className="font-display text-lg font-semibold text-parchment-100">Answer Sheet Preview</h3>
          <p className="text-sm text-gray-500">Download exactly as shown via direct PDF export</p>
        </div>
        <button 
          onClick={printSheet} 
          disabled={isGeneratingPdf}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
          {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>

      {/* Printable content */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div ref={sheetRef} className="answer-sheet p-10 text-gray-900" style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '11pt', lineHeight: 1.7, backgroundColor: 'white' }}>

          {/* Exam Header */}
          <div className="border-2 border-gray-900 p-5 mb-8">
            <h1 className="font-display text-2xl font-bold text-center text-gray-900 border-b border-gray-400 pb-3 mb-3">
              {metadata.exam_title || 'ASSESSMENT ANSWER SHEET'}
            </h1>
            
            <div className={`grid gap-x-8 gap-y-1 text-sm text-gray-700 ${formData?.headerOptions ? 'grid-cols-2' : ''}`}>
              {/* Conditional rendering based on user configuration */}
              {(!formData || formData.headerOptions?.courseName) && (metadata.subject_name || formData?.courseName) && (
                <div className="flex gap-2"><span className="font-semibold text-gray-500 w-32">Course Name:</span><span>{formData?.courseName || metadata.subject_name}</span></div>
              )}
              {(!formData || formData.headerOptions?.courseCode) && (metadata.subject_code || formData?.courseCode) && (
                <div className="flex gap-2"><span className="font-semibold text-gray-500 w-32">Course Code:</span><span className="font-mono">{formData?.courseCode || metadata.subject_code}</span></div>
              )}
              {(!formData || formData.headerOptions?.studentName) && (metadata.student_name || formData?.studentName) && (
                <div className="flex gap-2"><span className="font-semibold text-gray-500 w-32">Student Name:</span><span className="font-semibold text-gray-900">{formData?.studentName || metadata.student_name}</span></div>
              )}
              {(!formData || formData.headerOptions?.registrationNumber) && (metadata.registration_number || formData?.registrationNumber) && (
                <div className="flex gap-2"><span className="font-semibold text-gray-500 w-32">Reg. Number:</span><span className="font-mono font-semibold text-gray-900">{formData?.registrationNumber || metadata.registration_number}</span></div>
              )}
              {(!formData || formData.headerOptions?.semester) && metadata.semester && (
                <div className="flex gap-2"><span className="font-semibold text-gray-500 w-32">Semester:</span><span>{metadata.semester}</span></div>
              )}
              {formData?.headerOptions?.facultyName && formData?.facultyName && (
                <div className="flex gap-2"><span className="font-semibold text-gray-500 w-32">Faculty Name:</span><span>{formData.facultyName}</span></div>
              )}
              {(!formData || formData.headerOptions?.date) && (
                <div className="flex gap-2"><span className="font-semibold text-gray-500 w-32">Generated On:</span><span>{new Date().toLocaleDateString()}</span></div>
              )}
            </div>
          </div>

          {/* Questions & Answers */}
          {questions?.map((q, qi) => (
            <div key={qi} className="mb-10 break-inside-avoid-page">
              {/* Question header */}
              <div className="mb-4">
                <p className="leading-relaxed text-gray-900">
                  <span className="font-bold">Q{q.q_number}.</span> {q.q_text}
                </p>
              </div>

              {/* Answer */}
              <div className="pl-4 space-y-4">
                {/* Plain text answer */}
                {q.answer?.plain_text && (
                  <p className="text-gray-900 leading-relaxed text-justify">{q.answer.plain_text}</p>
                )}

                {/* LaTeX math */}
                {q.answer?.latex_math && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-black">
                    {q.answer.latex_math}
                  </div>
                )}

                {/* Steps */}
                {q.answer?.explanation_steps?.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-600 uppercase tracking-wider">Solution Steps</p>
                    <ol className="space-y-1.5">
                      {q.answer.explanation_steps.map((step, si) => (
                        <li key={si} className="text-gray-800 flex gap-3">
                          <span className="font-bold text-gray-500 flex-shrink-0">{si + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Code snippets */}
                {q.answer?.code_snippets?.map((snippet, ci) => {
                   const userName = metadata.student_name ? metadata.student_name.replace(/\s+/g, '').toLowerCase() : 'user'
                   let runCommand = `./a.out`
                   if (snippet.language.toLowerCase() === 'python') runCommand = `python3 ${snippet.filename}`
                   else if (snippet.language.toLowerCase() === 'java') runCommand = `java ${snippet.filename.replace('.java', '')}`
                   else if (snippet.language.toLowerCase() === 'javascript') runCommand = `node ${snippet.filename}`

                   return (
                    <div key={ci} className="space-y-4 html2pdf__page-break">
                      
                      {/* Blank Code view */}
                      <div className="mt-4">
                        <div className="font-bold mb-1 text-gray-900">Code:</div>
                        <pre 
                          className="whitespace-pre-wrap text-gray-800 font-mono" 
                          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word', display: 'block' }}
                        >
                          {snippet.code}
                        </pre>
                      </div>

                      {/* Terminal Output Snapshot */}
                      {snippet.expected_output && (
                        <div>
                          <div className="inline-block border border-gray-700 bg-black shadow-lg max-w-full">
                            <div className="p-4 font-mono leading-relaxed text-left">
                              <div className="text-white">
                                <span className="text-white">{userName}@MacBook-Pro ~ % </span>
                                <span>{runCommand}</span>
                              </div>
                              <div className="text-gray-200 mt-2 whitespace-pre-wrap">
                                {snippet.expected_output}
                              </div>
                              <div className="text-white mt-2">
                                {userName}@MacBook-Pro ~ % <span className="w-2 h-4 bg-white inline-block align-middle ml-1 animate-pulse"></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* UML diagrams using real renderer */}
                {q.answer?.uml_diagrams?.map((d, di) => (
                  <PrintableUMLDiagram key={di} diagram={d} index={di} />
                ))}

                {/* Conclusion */}
                {q.answer?.conclusion && (
                  <p className="text-gray-800 italic border-t border-gray-200 pt-3 mt-2">
                    {q.answer.conclusion}
                  </p>
                )}
              </div>

              {qi < questions.length - 1 && <hr className="mt-8 border-dashed border-gray-300" />}
            </div>
          ))}
          
        </div>
      </div>
    </div>
  )
}
