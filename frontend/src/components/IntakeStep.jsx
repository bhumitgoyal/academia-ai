import { useState, useRef } from 'react'
import { Upload, FileText, Type, ChevronRight, AlertCircle, Sparkles, User, Hash, FileCode } from 'lucide-react'

export default function IntakeStep({ formData, setFormData, onGenerate }) {
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  const update = (key, val) => setFormData(prev => ({ ...prev, [key]: val }))

  const handleFile = (file) => {
    if (!file) return
    const valid = ['.pdf', '.docx', '.txt'].some(ext => file.name.toLowerCase().endsWith(ext))
    if (!valid) { alert('Please upload a PDF, DOCX, or TXT file.'); return }
    update('file', file)
    update('inputMode', 'file')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const canGenerate = formData.studentName.trim() && formData.registrationNumber.trim() &&
    (formData.file || formData.textContent.trim().length > 50)

  const fileSizeStr = formData.file ? (formData.file.size / 1024).toFixed(1) + ' KB' : ''

  return (
    <div className="space-y-8 animate-fade-up">

      {/* Hero */}
      <div className="text-center space-y-4 pt-4 stagger-1 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full text-gold-400 text-sm">
          <Sparkles className="w-4 h-4" />
          Powered by Claude claude-opus-4-6 + Real Code Execution
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-parchment-50 leading-tight">
          Upload Your Assessment.<br />
          <span className="text-gold-400 italic">Get a Perfect Answer Sheet.</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-body">
          PDF, DOCX, or plain text — math, code, diagrams, and LaTeX all generated automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: Student Info */}
        <div className="lg:col-span-2 space-y-5 stagger-2 animate-fade-up">
          <div className="glass rounded-2xl p-6 gold-border space-y-5">
            <h3 className="font-display text-lg font-semibold text-parchment-100 flex items-center gap-2">
              <User className="w-5 h-5 text-gold-400" />
              Student Information
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-body uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Arjun Sharma"
                value={formData.studentName}
                onChange={e => update('studentName', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-body uppercase tracking-wider">Registration Number</label>
              <input
                type="text"
                className="input-field font-mono"
                placeholder="e.g. 22BCS1045"
                value={formData.registrationNumber}
                onChange={e => update('registrationNumber', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-body uppercase tracking-wider">Course Name <span className="text-gray-600">(Optional)</span></label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Data Structures"
                  value={formData.courseName}
                  onChange={e => update('courseName', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-body uppercase tracking-wider">Course Code <span className="text-gray-600">(Optional)</span></label>
                <input
                  type="text"
                  className="input-field font-mono"
                  placeholder="e.g. CS301"
                  value={formData.courseCode}
                  onChange={e => update('courseCode', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-body uppercase tracking-wider">Faculty Name <span className="text-gray-600">(Optional)</span></label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Dr. A. Kumar"
                value={formData.facultyName}
                onChange={e => update('facultyName', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-body uppercase tracking-wider flex items-center gap-1">
                <Hash className="w-3 h-3" />
                Additional Requirements
              </label>
              <textarea
                className="input-field resize-none"
                rows={4}
                placeholder={"e.g.\n- Use Python 3.11\n- Show time complexity for all algos\n- Diagrams required for Q3\n- Step-by-step derivations"}
                value={formData.additionalRequirements}
                onChange={e => update('additionalRequirements', e.target.value)}
              />
              <p className="text-xs text-gray-600">Optional — specifies language preferences, diagram requirements, etc.</p>
            </div>
          </div>

          {/* Header Configuration Checkboxes */}
          <div className="glass rounded-2xl p-6 gold-border space-y-4">
            <h3 className="font-display text-lg font-semibold text-parchment-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-400" />
              Answer Sheet Header
            </h3>
            <p className="text-xs text-gray-400 mb-2">Select which fields to include on the generated PDF:</p>
            
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
              {Object.entries({
                courseName: 'Course Name',
                courseCode: 'Course Code',
                studentName: 'Student Name',
                registrationNumber: 'Reg. Number',
                semester: 'Semester',
                facultyName: 'Faculty Name',
                date: 'Date Generated'
              }).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer hover:text-parchment-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.headerOptions[key]}
                    onChange={e => update('headerOptions', {
                      ...formData.headerOptions,
                      [key]: e.target.checked
                    })}
                    className="w-4 h-4 rounded border-gray-600 bg-ink-800 text-gold-500 focus:ring-gold-500/50 focus:ring-offset-ink-900"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: File Upload + Text Input */}
        <div className="lg:col-span-3 space-y-4 stagger-3 animate-fade-up">

          {/* Mode toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => update('inputMode', 'file')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${formData.inputMode === 'file' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
            <button
              onClick={() => update('inputMode', 'text')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${formData.inputMode === 'text' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Type className="w-4 h-4" />
              Paste Text
            </button>
          </div>

          {formData.inputMode === 'file' ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`glass rounded-2xl p-10 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[280px] text-center
                ${dragging ? 'border-gold-400/60 bg-gold-500/5 gold-glow' : 'gold-border hover:border-gold-400/40 hover:bg-ink-800/50'}`}
            >
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={e => handleFile(e.target.files[0])}
              />

              {formData.file ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gold-500/10 border border-gold-500/30 rounded-2xl flex items-center justify-center mx-auto">
                    <FileCode className="w-8 h-8 text-gold-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-parchment-50 text-lg">{formData.file.name}</p>
                    <p className="text-gray-500 text-sm mt-1">{fileSizeStr} · Click to change</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs">
                    ✓ Ready to process
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-ink-700 border-2 border-dashed border-ink-500 rounded-2xl flex items-center justify-center mx-auto transition-all duration-300">
                    <Upload className={`w-8 h-8 transition-colors ${dragging ? 'text-gold-400' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className="text-parchment-100 font-semibold text-lg">Drop your assessment here</p>
                    <p className="text-gray-500 text-sm mt-1">or click to browse</p>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    {['.PDF', '.DOCX', '.TXT'].map(ext => (
                      <span key={ext} className="px-2 py-1 bg-ink-700 border border-ink-600 rounded text-xs text-gray-400 font-mono">{ext}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 gold-border space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FileText className="w-4 h-4" />
                Paste your assessment questions below
              </div>
              <textarea
                className="input-field resize-none font-mono text-sm"
                rows={14}
                placeholder={"Subject: Data Structures and Algorithms\nSubject Code: CS301\n\nQ1. Explain the concept of AVL trees and describe the rotation operations...\n\nQ2. Write a Python program to implement Dijkstra's algorithm..."}
                value={formData.textContent}
                onChange={e => update('textContent', e.target.value)}
              />
              <p className="text-xs text-gray-600">{formData.textContent.length} characters</p>
            </div>
          )}

          {/* Info cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '🧮', label: 'LaTeX Math', desc: 'Full equations' },
              { icon: '💻', label: 'Live Code', desc: 'Real execution' },
              { icon: '📊', label: 'UML Diagrams', desc: 'Auto-generated' },
            ].map(card => (
              <div key={card.label} className="glass rounded-xl p-3 gold-border text-center space-y-1">
                <span className="text-2xl">{card.icon}</span>
                <p className="text-xs font-semibold text-parchment-100">{card.label}</p>
                <p className="text-xs text-gray-500">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generate button */}
      <div className="flex justify-center stagger-4 animate-fade-up">
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className={`flex items-center gap-3 px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
            canGenerate
              ? 'btn-primary gold-glow hover:scale-105'
              : 'bg-ink-700 text-gray-600 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          Generate Answer Sheet
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {!canGenerate && (formData.studentName || formData.registrationNumber) && (
        <p className="text-center text-xs text-gray-600 flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Fill in student name, registration number, and upload an assessment to continue
        </p>
      )}
    </div>
  )
}
