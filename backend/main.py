"""
AcademiaAI - Assessment Maker Backend
FastAPI server with Claude API integration, file parsing, and Piston code execution
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, List
import openai
import base64
import json
import httpx
import asyncio
import tempfile
import os
import io
from pypdf import PdfReader
import re
from pathlib import Path
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AcademiaAI Assessment Maker", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI client — reads OPENAI_API_KEY from environment
try:
    client = openai.OpenAI()
    logger.info("Successfully initialized OpenAI client.")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")
    client = None


PISTON_API = "https://emkc.org/api/v2/piston"

LANGUAGE_VERSIONS = {
    "python": "3.10.0",
    "java": "15.0.2",
    "cpp": "10.2.0",
    "c": "10.2.0",
    "matlab": None,  # Piston doesn't support MATLAB — use octave
    "octave": "6.1.0",
}

SYSTEM_PROMPT = """You are AcademiaAI — an elite academic assistant and document engineer for university-level assessments.

Your job: ingest assessment questions and produce COMPREHENSIVE, PROFESSIONAL answer sheets.

CRITICAL VOICE RULES:
- Write like a capable final-year undergraduate: confident, precise, slightly academic
- Use: "We can observe that...", "It follows that...", "Note that...", "This can be verified by..."
- NEVER sound like an AI chatbot: no "Certainly!", no "It's important to note", no excessive bullet points for theory
- Mix prose paragraphs with structured elements naturally

OUTPUT: Return ONLY valid JSON. No markdown fences. No preamble. No explanation outside JSON.

JSON SCHEMA:
{
  "metadata": {
    "subject_name": "string",
    "subject_code": "string", 
    "exam_title": "string",
    "semester": "string",
    "student_name": "string",
    "registration_number": "string",
    "date_generated": "string"
  },
  "questions": [
    {
      "q_number": "1",
      "q_text": "Full question text",
      "type": "theory | math | coding | diagram | mixed",
      "difficulty": "easy | medium | hard",
      "answer": {
        "plain_text": "Full answer written in student voice — comprehensive, no filler",
        "latex_math": "LaTeX math if needed — use $$ for display, $ for inline. Empty string if not applicable.",
        "explanation_steps": ["Step 1 description", "Step 2 description"],
        "code_snippets": [
          {
            "language": "python",
            "filename": "solution_q1.py",
            "code": "# Full working, executable code",
            "expected_output": "What the output should look like",
            "libraries_required": ["numpy"],
            "install_command": "pip install numpy"
          }
        ],
        "uml_diagrams": [
          {
            "diagram_type": "class | sequence | flowchart | activity | er | usecase | stateDiagram",
            "title": "Diagram Title",
            "mermaid_code": "valid mermaid syntax here",
            "description": "What this diagram illustrates"
          }
        ],
        "conclusion": "Brief conclusive statement"
      }
    }
  ],
  "latex_full_document": "Complete LaTeX source — full compilable .tex document with all answers, professional formatting, amsmath, listings, fancyhdr packages",
  "summary": {
    "total_questions": 0,
    "difficulty_distribution": {"easy": 0, "medium": 0, "hard": 0},
    "topics_covered": ["topic1", "topic2"]
  }
}

CRITICAL RULES FOR GENERATION:
- You MUST answer EVERY SINGLE question present in the assessment. Do not skip any question, regardless of length.
- The LaTeX document must include the solutions for every single question.

LATEX DOCUMENT RULES:
- Use documentclass{article} with geometry, amsmath, amssymb, listings, xcolor, fancyhdr, hyperref, tikz
- Professional exam answer sheet header with student info box
- Each question clearly numbered in margin
- Code listings with syntax highlighting via listings package
- Mermaid diagrams: CRITICAL - MUST use valid syntactic formatting. AVOID UNESCAPED PARENTHESES `()` in node labels, e.g., use `A["Label with (parens)"]` instead of `A[Label (parens)]`. Wait until rendering.
- Footer with student name, reg number, page numbers
- The LaTeX must be FULLY compilable on Overleaf without modifications

UML DIAGRAM RULES:
- Minimum 6+ nodes/relationships per diagram
- Must accurately represent the answer content
- Valid Mermaid.js syntax only
- Meaningful labels on all connections

CODE RULES:
- Code must be ACTUALLY EXECUTABLE — not pseudocode
- Include all necessary imports
- Add brief inline comments explaining logic
- If the code requires user input (e.g., `input()` or `Scanner`), ALWAYS mock a fabricated test case in `expected_output` showing the prompt and user input
- For math problems: show computation steps in code too
- Multiple languages when question is language-agnostic
"""


class GenerateRequest(BaseModel):
    student_name: str
    registration_number: str
    additional_requirements: Optional[str] = ""
    text_content: Optional[str] = None


class ExecuteCodeRequest(BaseModel):
    language: str
    code: str
    stdin: Optional[str] = ""


@app.get("/")
async def root():
    return {"status": "AcademiaAI Backend Running", "version": "1.0.0"}


@app.post("/api/generate")
async def generate_assessment(
    student_name: str = Form(...),
    registration_number: str = Form(...),
    additional_requirements: str = Form(""),
    text_content: str = Form(""),
    file: Optional[UploadFile] = File(None),
):
    """
    Main generation endpoint. Accepts file upload OR text content.
    Returns structured JSON with answers, LaTeX, diagrams, code.
    """
    try:
        messages = []
        user_content = []

        if not client:
            raise HTTPException(status_code=500, detail="OpenAI API key is missing or invalid on the server.")

        # Build context string
        context = f"""
Student Name: {student_name}
Registration Number: {registration_number}
Additional Requirements: {additional_requirements if additional_requirements else "None specified"}

Please extract subject name, subject code, exam title, and all questions from the provided assessment.
Generate comprehensive answers following the JSON schema exactly.
"""

        if file and file.filename:
            file_bytes = await file.read()
            filename = file.filename.lower()

            if filename.endswith(".pdf"):
                # Extract text using PyPDF
                pdf_reader = PdfReader(io.BytesIO(file_bytes))
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                user_content.append({
                    "type": "text",
                    "text": f"ASSESSMENT CONTENT (extracted from PDF):\n\n{text}\n\n{context}"
                })

            elif filename.endswith(".docx"):
                # For DOCX, frontend should send extracted text
                # Backend receives as text_content
                user_content.append({
                    "type": "text",
                    "text": f"ASSESSMENT CONTENT (extracted from DOCX):\n\n{text_content}\n\n{context}"
                })

            else:
                # Plain text file
                text = file_bytes.decode("utf-8", errors="replace")
                user_content.append({
                    "type": "text",
                    "text": f"ASSESSMENT CONTENT:\n\n{text}\n\n{context}"
                })

        elif text_content:
            user_content.append({
                "type": "text",
                "text": f"ASSESSMENT CONTENT:\n\n{text_content}\n\n{context}"
            })
        else:
            raise HTTPException(status_code=400, detail="No assessment content provided")

        messages.append({"role": "system", "content": SYSTEM_PROMPT})
        messages.append({"role": "user", "content": user_content})

        logger.info(f"Sending request to OpenAI for student: {student_name}")

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            response_format={"type": "json_object"}
        )

        raw_text = response.choices[0].message.content.strip()

        # Strip any accidental markdown fences (just in case)
        raw_text = re.sub(r'^```json\s*', '', raw_text)
        raw_text = re.sub(r'\s*```$', '', raw_text)
        raw_text = raw_text.strip()

        result = json.loads(raw_text)

        # Inject student info into metadata (override LLM extraction with form data)
        if "metadata" not in result:
            result["metadata"] = {}
        result["metadata"]["student_name"] = student_name
        result["metadata"]["registration_number"] = registration_number

        logger.info(f"Successfully generated {len(result.get('questions', []))} answers")
        return JSONResponse(content=result)

    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}\nRaw: {raw_text[:500]}")
        raise HTTPException(status_code=500, detail=f"LLM returned malformed JSON: {str(e)}")
    except openai.OpenAIError as e:
        logger.error(f"OpenAI API error: {e}")
        raise HTTPException(status_code=500, detail=f"API error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/execute")
async def execute_code(req: ExecuteCodeRequest):
    """
    Execute code via Piston API (real sandbox execution).
    Supports Python, Java, C++, C, Octave (MATLAB substitute).
    """
    lang = req.language.lower()

    # Map matlab -> octave
    piston_lang = "octave" if lang == "matlab" else lang
    version = LANGUAGE_VERSIONS.get(piston_lang, "*")

    if version is None:
        return JSONResponse(content={
            "stdout": "MATLAB execution not available. Showing expected output based on code analysis.",
            "stderr": "",
            "simulated": True
        })

    payload = {
        "language": piston_lang,
        "version": version,
        "files": [{"name": f"main.{'py' if lang=='python' else 'java' if lang=='java' else 'cpp' if lang=='cpp' else 'c' if lang=='c' else 'm'}", "content": req.code}],
        "stdin": req.stdin or "",
        "args": [],
        "compile_timeout": 30000,
        "run_timeout": 10000,
    }

    try:
        async with httpx.AsyncClient(timeout=40.0) as http_client:
            resp = await http_client.post(f"{PISTON_API}/execute", json=payload)
            resp.raise_for_status()
            data = resp.json()

        run = data.get("run", {})
        compile_info = data.get("compile", {})

        result = {
            "stdout": run.get("stdout", ""),
            "stderr": run.get("stderr", "") or compile_info.get("stderr", ""),
            "exit_code": run.get("code", 0),
            "simulated": False,
            "language": piston_lang,
            "version": data.get("language", {}).get("version", version) if isinstance(data.get("language"), dict) else version,
        }
        return JSONResponse(content=result)

    except httpx.HTTPError as e:
        logger.error(f"Piston API error: {e}")
        return JSONResponse(content={
            "stdout": "",
            "stderr": f"Execution service unavailable: {str(e)}",
            "exit_code": 1,
            "simulated": False
        })


@app.post("/api/regenerate-answer")
async def regenerate_answer(
    question: str = Form(...),
    subject: str = Form(""),
    tone: str = Form("standard"),  # brief | standard | detailed
    student_name: str = Form(""),
    registration_number: str = Form(""),
):
    """Regenerate a single question's answer with optional tone adjustment."""
    tone_instruction = {
        "brief": "Keep the answer concise — 2-3 paragraphs max. Prioritize key points.",
        "standard": "Standard depth — cover all key aspects thoroughly.",
        "detailed": "Extremely detailed — include derivations, edge cases, multiple approaches, comparisons.",
    }.get(tone, "standard")

    if not client:
        raise HTTPException(status_code=500, detail="OpenAI API key is missing or invalid on the server.")

    prompt = f"""
Subject: {subject}
Question: {question}

{tone_instruction}

Return JSON for a SINGLE answer object matching this schema:
{{
  "plain_text": "...",
  "latex_math": "...",
  "explanation_steps": [],
  "code_snippets": [],
  "uml_diagrams": [],
  "conclusion": "..."
}}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        raw = response.choices[0].message.content.strip()
        raw = re.sub(r'^```json\s*', '', raw)
        raw = re.sub(r'\s*```$', '', raw)
        return JSONResponse(content=json.loads(raw))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health():
    return {"status": "healthy", "piston_api": PISTON_API}
