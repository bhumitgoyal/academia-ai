#!/bin/bash
# AcademiaAI — One-command setup script

set -e

echo ""
echo "🎓 AcademiaAI Assessment Maker — Setup"
echo "======================================="
echo ""

# Check prerequisites
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 required but not found."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js required but not found."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm required but not found."; exit 1; }

echo "✅ Prerequisites found"
echo ""

# Backend setup
echo "📦 Setting up Python backend..."
cd backend

if [ ! -d "venv" ]; then
  python3 -m venv venv
  echo "  Created virtual environment"
fi

source venv/bin/activate
pip install -r requirements.txt -q
echo "  Installed Python dependencies"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo ""
  echo "⚠️  Created .env file. Please add your OPENAI_API_KEY:"
  echo "   Edit: backend/.env"
  echo ""
fi

cd ..

# Frontend setup
echo "📦 Setting up React frontend..."
cd frontend
npm install --silent
echo "  Installed Node dependencies"
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo ""
echo "  Terminal 1 (Backend):"
echo "  cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000"
echo ""
echo "  Terminal 2 (Frontend):"
echo "  cd frontend && npm run dev"
echo ""
echo "  Then open: http://localhost:5173"
echo ""
