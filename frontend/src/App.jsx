import { useState, useEffect } from 'react'
import { Github, Instagram, Linkedin, Heart } from 'lucide-react'
import IntakeStep from './components/IntakeStep'
import ProcessingStep from './components/ProcessingStep'
import OutputView from './components/OutputView'
import Header from './components/Header'
import { apiUrl } from './api/client'

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

      const resp = await fetch(apiUrl('/api/generate'), { method: 'POST', body: fd })
      if (!resp.ok) {
        let errorMsg = 'Generation failed'
        try {
          const err = await resp.json()
          errorMsg = err.detail || errorMsg
        } catch {
          errorMsg = `Server error (${resp.status})`
        }
        throw new Error(errorMsg)
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
    <div className="min-h-screen bg-ink-950 font-body flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gold-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-gold-400/3 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex-1">
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
              setResult={setResult}
              onReset={handleReset}
              formData={formData}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gold-500/10 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
            <span>by</span>
            <a
              href="https://github.com/bhumitgoyal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:text-gold-300 font-semibold transition-colors"
            >
              Bhumit Goyal
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://github.com/bhumitgoyal" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gold-400 transition-colors">
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <span className="text-gray-700">·</span>
            <a href="https://linkedin.com/in/bhumitgoyal" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gold-400 transition-colors">
              <Linkedin className="w-4 h-4" />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
            <span className="text-gray-700">·</span>
            <a href="https://instagram.com/bhumitgoyal" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gold-400 transition-colors">
              <Instagram className="w-4 h-4" />
              <span className="hidden sm:inline">Instagram</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
