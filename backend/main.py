from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
import json
import tempfile
import os
import shutil
from pathlib import Path

# Import des processeurs de scripts
from processors import PROCESSORS_REGISTRY, process_files

app = FastAPI(
    title="Excel Processing API",
    description="API pour le traitement de fichiers Excel",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # ton frontend en prod ou localhost en dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_EXTENSIONS = {'.xlsx', '.xls'}


@app.get("/")
async def root():
    """Endpoint racine"""
    return {
        "message": "Excel Processing API",
        "version": "1.0.0",
        "endpoints": {
            "treatments": "/api/treatments",
            "process": "/api/process/{treatment_id}"
        }
    }


@app.get("/api/treatments")
async def get_treatments():
    """Liste tous les traitements disponibles"""
    return {
        "treatments": [
            {
                "id": processor_id,
                "name": config["name"],
                "description": config["description"],
                "files": config["files"],
                "params": config["params"]
            }
            for processor_id, config in PROCESSORS_REGISTRY.items()
        ]
    }


@app.post("/api/process/{treatment_id}")
async def process_treatment(
    treatment_id: str,
    params: str = Form(...),
    **files: UploadFile
):
    """
    Traite un fichier Excel selon le traitement sélectionné
    
    Args:
        treatment_id: ID du traitement à appliquer
        params: Paramètres JSON sous forme de string
        **files: Fichiers uploadés (clés dynamiques selon le traitement)
    """
    
    # Vérifier que le traitement existe
    if treatment_id not in PROCESSORS_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Traitement '{treatment_id}' non trouvé")
    
    processor_config = PROCESSORS_REGISTRY[treatment_id]
    
    # Parser les paramètres
    try:
        params_dict = json.loads(params)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Paramètres JSON invalides")
    
    # Créer un répertoire temporaire pour ce traitement
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Sauvegarder les fichiers uploadés temporairement
        uploaded_files = {}
        
        for file_id, file_config in processor_config["files"].items():
            # Récupérer le fichier depuis la requête
            file_key = f"file_{file_id}"  # Convention de nommage
            
            if file_key not in files:
                raise HTTPException(
                    status_code=400,
                    detail=f"Fichier manquant: {file_config['label']}"
                )
            
            upload_file = files[file_key]
            
            # Valider l'extension
            file_ext = Path(upload_file.filename).suffix.lower()
            if file_ext not in ALLOWED_EXTENSIONS:
                raise HTTPException(
                    status_code=400,
                    detail=f"Extension non autorisée: {file_ext}. Extensions acceptées: {', '.join(ALLOWED_EXTENSIONS)}"
                )
            
            # Valider la taille
            content = await upload_file.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"Fichier trop volumineux. Taille maximale: {MAX_FILE_SIZE / (1024*1024)} MB"
                )
            
            # Sauvegarder le fichier
            temp_file_path = os.path.join(temp_dir, f"{file_id}{file_ext}")
            with open(temp_file_path, 'wb') as f:
                f.write(content)
            
            uploaded_files[file_id] = temp_file_path
        
        # Valider les paramètres requis
        for param_id, param_config in processor_config["params"].items():
            if param_id not in params_dict:
                raise HTTPException(
                    status_code=400,
                    detail=f"Paramètre manquant: {param_config['label']}"
                )
        
        # Exécuter le traitement
        result_path = process_files(treatment_id, uploaded_files, params_dict)
        
        if not os.path.exists(result_path):
            raise HTTPException(
                status_code=500,
                detail="Le traitement n'a pas produit de fichier résultat"
            )
        
        # Générer le nom du fichier résultat
        result_filename = f"resultat_{treatment_id}_{params_dict.get('export_date', 'output')}.xlsx"
        
        # Retourner le fichier
        return FileResponse(
            path=result_path,
            filename=result_filename,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            background=lambda: cleanup_temp_dir(temp_dir)  # Nettoyer après l'envoi
        )
        
    except HTTPException:
        # Nettoyer immédiatement en cas d'erreur HTTP
        cleanup_temp_dir(temp_dir)
        raise
    except Exception as e:
        # Nettoyer et renvoyer une erreur générique
        cleanup_temp_dir(temp_dir)
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement: {str(e)}")


def cleanup_temp_dir(temp_dir: str):
    """Supprime le répertoire temporaire"""
    try:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
    except Exception as e:
        print(f"Erreur lors du nettoyage du répertoire temporaire: {e}")
