# 🎓 AcademiaAI — Assessment Answer Generator

A full-stack application that ingests university assessment papers (PDF, DOCX, or plain text) and generates professional, college-student-voice answer sheets with:

- 📝 Structured text answers (academic voice, not AI-sounding)
- 🧮 LaTeX math rendering + downloadable `.tex` source
- 💻 Real code execution (Python, Java, C++, C) via Piston API
- 📊 Auto-generated UML diagrams (Mermaid.js, fully editable)
- 🖨️ Browser print-to-PDF for the answer sheet

---

## 🏗️ Architecture

```
assessment-maker/
├── backend/              # FastAPI (Python)
│   ├── main.py           # All API routes
│   ├── requirements.txt
│   └── .env.example
└── frontend/             # React + Vite + Tailwind
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── IntakeStep.jsx       # File upload + student info
    │   │   ├── ProcessingStep.jsx   # Loading animation
    │   │   ├── OutputView.jsx       # Tabbed output
    │   │   ├── AnswerSheetPreview.jsx  # Print-ready answer sheet
    │   │   ├── Terminal.jsx         # Real code execution display
    │   │   ├── UMLDiagram.jsx       # Mermaid renderer + editor
    │   │   └── LaTeXViewer.jsx      # LaTeX viewer + download
    │   └── styles/globals.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚡ Quick Start

### 1. Prerequisites

- Python 3.10+
- Node.js 18+
- An Anthropic API key → [console.anthropic.com](https://console.anthropic.com)

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the backend
uvicorn main:app --reload --port 8000
```

Backend will be running at `http://localhost:8000`

API docs available at `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be running at `http://localhost:5173`

---

### 4. Production Build

```bash
# Build frontend
cd frontend && npm run build

# Serve with uvicorn (mount static files)
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (required) |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate` | Main generation — accepts file + form data |
| `POST` | `/api/execute` | Execute code via Piston API |
| `POST` | `/api/regenerate-answer` | Regenerate a single question's answer |
| `GET` | `/api/health` | Health check |
| `GET` | `/docs` | FastAPI Swagger UI |

---

## 📁 Accepted Input Formats

| Format | Handling |
|--------|----------|
| `.pdf` | Sent as base64 to Claude claude-opus-4-6 API |
| `.docx` | Parsed client-side with Mammoth.js, text sent to API |
| `.txt` | Read as plain text |
| Text box | Direct string injection |

---

## 💡 Tips for Best Results

1. **Include marks per question** in your assessment — e.g., "(10 marks)"
2. **Include subject name and code** in the header of your document
3. **Use Additional Requirements** to specify language preferences, diagram needs, etc.
4. Complex assessments with 10+ questions may take 45–60 seconds
5. For MATLAB questions, the system uses GNU Octave (compatible syntax)

---

## 🛠️ Customization

### Change the AI model
In `backend/main.py`:
```python
model="claude-opus-4-6"  # Change to claude-sonnet-4-6 for faster/cheaper
```

### Adjust answer verbosity
The frontend Summary tab has per-question tone controls: Brief / Standard / Detailed

### Modify the system prompt
In `backend/main.py`, edit the `SYSTEM_PROMPT` constant to adjust:
- Answer voice and style
- LaTeX document formatting
- Code generation preferences

### Add more languages
In `backend/main.py`, add to `LANGUAGE_VERSIONS`:
```python
"rust": "1.50.0",
"go": "1.16.2",
```
Piston supports 75+ languages — check: `https://emkc.org/api/v2/piston/runtimes`

---

## 🐛 Troubleshooting

**"JSON parse error"** — The LLM returned malformed JSON. Try regenerating; happens ~5% of time with very complex assessments.

**"Piston API unavailable"** — The free Piston sandbox may be temporarily down. Code snippets will show expected output from the LLM instead.

**DOCX not parsing** — Ensure Mammoth.js loaded (check browser console). Complex DOCX with embedded images may not parse perfectly.

**KaTeX not rendering** — Ensure LaTeX delimiters are correct: `$$...$$` for display math, `$...$` for inline.

---

## 📄 License

MIT — use freely, attribution appreciated.
