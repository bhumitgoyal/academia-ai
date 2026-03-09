import { useState, useEffect } from 'react'
import IntakeStep from './components/IntakeStep'
import ProcessingStep from './components/ProcessingStep'
import OutputView from './components/OutputView'
import Header from './components/Header'

export default function App() {
  const [step, setStep] = useState('intake') // intake | processing | output
  const [formData, setFormData] = useState({
    studentName: '',
    registrationNumber: '',
    courseName: '',
    courseCode: '',
    facultyName: '',
    additionalRequirements: '',
    file: null,
    textContent: '',
    inputMode: 'file', // file | text
    headerOptions: {
      courseName: true,
      courseCode: true,
      studentName: true,
      registrationNumber: true,
      semester: true,
      facultyName: false,
      date: true
    }
  })
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [darkMode] = useState(true)

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  const handleGenerate = async () => {
    setStep('processing')
    setError(null)

    try {
      const fd = new FormData()
      fd.append('student_name', formData.studentName)
      fd.append('registration_number', formData.registrationNumber)
      fd.append('course_name', formData.courseName)
      fd.append('course_code', formData.courseCode)
      fd.append('faculty_name', formData.facultyName)
      fd.append('additional_requirements', formData.additionalRequirements)

      if (formData.inputMode === 'file' && formData.file) {
        const ext = formData.file.name.toLowerCase()
        if (ext.endsWith('.docx')) {
          // Extract text from DOCX using mammoth before sending
          const mammoth = (await import('mammoth')).default
          const arrayBuffer = await formData.file.arrayBuffer()
          const { value } = await mammoth.extractRawValue({ arrayBuffer })
          fd.append('text_content', value)
          fd.append('file', formData.file)
        } else {
          fd.append('file', formData.file)
          fd.append('text_content', '')
        }
      } else {
        fd.append('text_content', formData.textContent)
      }

      const resp = await fetch('/api/generate', { method: 'POST', body: fd })
      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.detail || 'Generation failed')
      }

      const data = await resp.json()
      setResult(data)
      setStep('output')
    } catch (err) {
      setError(err.message)
      setStep('intake')
    }
  }

  const handleReset = () => {
    setStep('intake')
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-ink-950 font-body">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gold-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-gold-400/3 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10">
        <Header step={step} onReset={handleReset} />

        <main className="max-w-6xl mx-auto px-4 pb-20">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              ⚠ {error}
            </div>
          )}

          {step === 'intake' && (
            <IntakeStep
              formData={formData}
              setFormData={setFormData}
              onGenerate={handleGenerate}
            />
          )}

          {step === 'processing' && (
            <ProcessingStep />
          )}

          {step === 'output' && result && (
            <OutputView
              result={result}
              onReset={handleReset}
              formData={formData}
            />
          )}
        </main>
      </div>
    </div>
  )
}
