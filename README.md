# 🎓 AcademiaAI — Assessment Answer Generator

> **Built by [Bhumit Goyal](https://github.com/bhumitgoyal)** — AI-powered assessment answer generation for university students.

[![GitHub](https://img.shields.io/badge/GitHub-bhumitgoyal-181717?logo=github)](https://github.com/bhumitgoyal)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-bhumitgoyal-0A66C2?logo=linkedin)](https://linkedin.com/in/bhumitgoyal)
[![Instagram](https://img.shields.io/badge/Instagram-bhumitgoyal-E4405F?logo=instagram)](https://instagram.com/bhumitgoyal)

A full-stack application that ingests university assessment papers (PDF, DOCX, or plain text) and generates professional, college-student-voice answer sheets with:

- 📝 Structured text answers (academic voice, not AI-sounding)
- 🧮 LaTeX math rendering + downloadable `.tex` source
- 💻 Real code execution (Python, Java, C++, C, JavaScript) via Piston API
- 📊 Auto-generated UML diagrams (Mermaid.js, fully editable)
- 🖨️ Browser PDF export for the answer sheet

---

## 🏗️ Architecture

```
academia-ai/
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
    │   │   ├── LaTeXViewer.jsx      # LaTeX viewer + download
    │   │   └── PrintableUMLDiagram.jsx
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
- An OpenAI API key → [platform.openai.com](https://platform.openai.com)

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
# Edit .env and add your OPENAI_API_KEY

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

# Serve with uvicorn
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key (required) |
| `FRONTEND_URL` | Frontend URL for CORS (optional, for deployment) |

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
| `.pdf` | Text extracted server-side via PyPDF, sent to GPT-4o |
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
model="gpt-4o"  # Change to gpt-4o-mini for faster/cheaper
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

## 👤 Author

**Bhumit Goyal**

- GitHub: [@bhumitgoyal](https://github.com/bhumitgoyal)
- LinkedIn: [bhumitgoyal](https://linkedin.com/in/bhumitgoyal)
- Instagram: [@bhumitgoyal](https://instagram.com/bhumitgoyal)

---

## 📄 License

MIT — use freely, attribution appreciated.
