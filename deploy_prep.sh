#!/bin/bash
# Script de préparation au déploiement

cd excel-processing-portal

# ============================================
# 1. CONFIGURATION BACKEND POUR RENDER
# ============================================

# backend/render.yaml (configuration Render)
cat > render.yaml << 'EOF'
services:
  # Backend API
  - type: web
    name: excel-processor-api
    env: python
    region: frankfurt
    plan: free
    branch: main
    buildCommand: "pip install -r backend/requirements.txt"
    startCommand: "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: FRONTEND_URL
        sync: false

  # Frontend static site
  - type: web
    name: excel-processor-frontend
    env: static
    region: frankfurt
    plan: free
    branch: main
    buildCommand: "cd frontend && npm install && npm run build"
    staticPublishPath: frontend/dist
    envVars:
      - key: VITE_API_URL
        sync: false
EOF

# ============================================
# 2. MODIFIER LE BACKEND POUR RENDER
# ============================================

# Mettre à jour backend/main.py pour gérer le PORT dynamique
cat > backend/main.py << 'PYEOF'
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import importlib.util
from pathlib import Path
import shutil

app = FastAPI(title="Excel Processing Portal API")

# Configuration CORS pour Render
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "https://*.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Créer les dossiers nécessaires
UPLOAD_DIR = Path("tmp/uploads")
PROCESSED_DIR = Path("tmp/processed")
PROCESSORS_DIR = Path("processors")

for directory in [UPLOAD_DIR, PROCESSED_DIR, PROCESSORS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

def load_processor(processor_name: str):
    """Charge dynamiquement un processeur"""
    processor_path = PROCESSORS_DIR / f"{processor_name}.py"
    if not processor_path.exists():
        raise HTTPException(status_code=404, detail=f"Processeur '{processor_name}' introuvable")
    
    spec = importlib.util.spec_from_file_location(processor_name, processor_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    
    if not hasattr(module, 'process'):
        raise HTTPException(status_code=500, detail=f"Le processeur '{processor_name}' n'a pas de fonction 'process'")
    
    return module.process

@app.get("/")
def root():
    return {
        "name": "Excel Processing Portal API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/processors")
def list_processors():
    """Liste tous les processeurs disponibles"""
    processors = []
    for file in PROCESSORS_DIR.glob("*.py"):
        if file.name != "__init__.py":
            processors.append({
                "id": file.stem,
                "name": file.stem.replace("_", " ").title()
            })
    return {"processors": processors}

@app.post("/api/process/{processor_name}")
async def process_file(processor_name: str, file: UploadFile = File(...)):
    """Traite un fichier Excel avec le processeur spécifié"""
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Le fichier doit être un fichier Excel (.xlsx ou .xls)")
    
    # Sauvegarder le fichier uploadé
    input_path = UPLOAD_DIR / file.filename
    with input_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Charger et exécuter le processeur
        processor_func = load_processor(processor_name)
        output_path = PROCESSED_DIR / f"processed_{file.filename}"
        
        # Exécuter le traitement
        processor_func(str(input_path), str(output_path))
        
        if not output_path.exists():
            raise HTTPException(status_code=500, detail="Le traitement n'a pas produit de fichier de sortie")
        
        return FileResponse(
            path=output_path,
            filename=f"processed_{file.filename}",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement: {str(e)}")
    
    finally:
        # Nettoyer les fichiers temporaires
        if input_path.exists():
            input_path.unlink()

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
PYEOF

# ============================================
# 3. MODIFIER LE FRONTEND POUR RENDER
# ============================================

# Mettre à jour vite.config.js
cat > frontend/vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
  }
})
EOF

# Mettre à jour App.jsx pour utiliser la variable d'environnement
cat > frontend/src/App.jsx << 'JSXEOF'
import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

function App() {
  const [processors, setProcessors] = useState([]);
  const [selectedProcessor, setSelectedProcessor] = useState('');
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProcessors();
  }, []);

  const fetchProcessors = async () => {
    try {
      const response = await fetch(`${API_URL}/api/processors`);
      const data = await response.json();
      setProcessors(data.processors);
      if (data.processors.length > 0) {
        setSelectedProcessor(data.processors[0].id);
      }
    } catch (err) {
      setError('Impossible de charger les processeurs');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedProcessor) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/process/${selectedProcessor}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors du traitement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setResult({
        url,
        filename: `processed_${file.name}`
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <FileSpreadsheet className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Portail de Traitement Excel
            </h1>
            <p className="text-gray-600">
              Uploadez votre fichier et sélectionnez un traitement
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner un processeur
                </label>
                <select
                  value={selectedProcessor}
                  onChange={(e) => setSelectedProcessor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {processors.map((proc) => (
                    <option key={proc.id} value={proc.id}>
                      {proc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier Excel
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="w-full flex flex-col items-center px-4 py-6 bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {file ? file.name : 'Cliquez pour sélectionner un fichier Excel'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={!file || processing}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? 'Traitement en cours...' : 'Traiter le fichier'}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-green-800 font-medium">Traitement réussi !</p>
                </div>
                <a
                  href={result.url}
                  download={result.filename}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger le fichier traité
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
JSXEOF

# ============================================
# 4. CRÉER UN EXEMPLE DE PROCESSEUR
# ============================================

cat > backend/processors/example_processor.py << 'EOF'
import pandas as pd

def process(input_path: str, output_path: str):
    """
    Exemple de processeur qui ajoute une colonne de calcul
    """
    df = pd.read_excel(input_path)
    
    # Exemple de traitement
    if 'Total' in df.columns and 'Quantité' in df.columns:
        df['Prix_Unitaire'] = df['Total'] / df['Quantité']
    
    df.to_excel(output_path, index=False)
EOF

# ============================================
# 5. INITIALISER GIT
# ============================================

git init
git add .
git commit -m "Initial commit - Ready for Render deployment"

echo "✅ Projet préparé pour le déploiement!"
echo ""
echo "📝 Prochaines étapes:"
echo "1. Créer un repo GitHub et pousser le code"
echo "2. Se connecter sur render.com"
echo "3. Suivre les instructions du guide de déploiement"