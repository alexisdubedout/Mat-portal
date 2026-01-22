"""
Module de gestion des processeurs de scripts

Chaque processeur doit exposer:
- Une configuration dans PROCESSORS_REGISTRY
- Une fonction process(files: dict, params: dict) -> str
"""

from .stock_tracking import process as stock_tracking_process

# Registre de tous les processeurs disponibles
PROCESSORS_REGISTRY = {
    "stock-tracking": {
        "name": "Suivi des Stocks",
        "description": "Mise à jour automatique du suivi mensuel et semestriel des stocks",
        "files": {
            "tracking": {
                "label": "Fichier de suivi",
                "accept": ".xlsx,.xls"
            },
            "export": {
                "label": "Fichier d'export",
                "accept": ".xlsx,.xls"
            }
        },
        "params": {
            "export_date": {
                "label": "Date d'export",
                "type": "text",
                "placeholder": "jj/mm/aaaa"
            }
        },
        "processor": stock_tracking_process
    },
    # Ajoutez d'autres processeurs ici
    # "sales-analysis": { ... },
    # "data-merge": { ... },
}


def process_files(processor_id: str, files: dict, params: dict) -> str:
    """
    Exécute le processeur correspondant
    
    Args:
        processor_id: ID du processeur
        files: Dictionnaire {file_id: chemin_fichier}
        params: Dictionnaire des paramètres
    
    Returns:
        Chemin du fichier résultat
    """
    if processor_id not in PROCESSORS_REGISTRY:
        raise ValueError(f"Processeur '{processor_id}' non trouvé")
    
    processor = PROCESSORS_REGISTRY[processor_id]["processor"]
    return processor(files, params)
