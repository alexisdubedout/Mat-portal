import React, { useState } from 'react';
import { Upload, FileSpreadsheet, TrendingUp, Database, ArrowLeft, Calendar, Check, Loader2, Download, AlertCircle } from 'lucide-react';

// Configuration des applications disponibles
const APPS_CONFIG = [
  {
    id: 'stock-tracking',
    name: 'Suivi des Stocks',
    description: 'Mise à jour automatique du suivi mensuel et semestriel des stocks',
    icon: FileSpreadsheet,
    color: 'from-blue-500 to-blue-600',
    files: [
      { id: 'tracking', label: 'Fichier de suivi', accept: '.xlsx,.xls' },
      { id: 'export', label: "Fichier d'export", accept: '.xlsx,.xls' }
    ],
    params: [
      { id: 'export_date', label: "Date d'export", type: 'date', placeholder: 'jj/mm/aaaa' }
    ]
  },
  {
    id: 'sales-analysis',
    name: 'Analyse des Ventes',
    description: 'Génération de rapports et analyses de ventes mensuelles',
    icon: TrendingUp,
    color: 'from-green-500 to-green-600',
    files: [
      { id: 'sales', label: 'Fichier des ventes', accept: '.xlsx,.xls' }
    ],
    params: [
      { id: 'period', label: 'Période', type: 'text', placeholder: 'Ex: Q1 2024' }
    ]
  },
  {
    id: 'data-merge',
    name: 'Fusion de Données',
    description: 'Consolidation de plusieurs fichiers Excel en un seul',
    icon: Database,
    color: 'from-purple-500 to-purple-600',
    files: [
      { id: 'file1', label: 'Premier fichier', accept: '.xlsx,.xls' },
      { id: 'file2', label: 'Deuxième fichier', accept: '.xlsx,.xls' }
    ],
    params: []
  }
];

const FUNNY_MESSAGES = [
  "Décompte des claviers qui ont fait un plongeon dans une mer de café...",
  "Vérification des souris qui sont passées par la fenêtre...",
  "Recensement des écrans radar qui ont pris un uppercut accidentel...",
  "Inventaire des ventilateurs qui ont pris des vacances sans préavis...",
  "Nettoyage des moniteurs qui ont perdu la bataille contre la poussière...",
  "Saisie des composants qui ont survécu à un marathon de stress intensif...",
  "Décompte des périphériques qui ont raté leur dernier atterrissage...",
  "Vérification des micros qui ont pris leur envol sans autorisation...",
  "Recensement des claviers qui ont décidé de faire une pause café prolongée..."
];

// Composant Card pour chaque application
function AppCard({ app, onClick }) {
  const Icon = app.icon;
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 border border-gray-700 hover:border-blue-500/50"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${app.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {app.name}
        </h3>
        
        <p className="text-gray-400 text-sm leading-relaxed">
          {app.description}
        </p>
      </div>
      
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-tl-full transform translate-x-16 translate-y-16 group-hover:translate-x-8 group-hover:translate-y-8 transition-transform duration-500"></div>
    </div>
  );
}

// Composant Zone de dépôt de fichier
function FileUploadZone({ fileConfig, file, onFileChange }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileChange(droppedFile);
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {fileConfig.label}
      </label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 scale-105'
            : file
            ? 'border-green-500 bg-green-500/10'
            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
        }`}
      >
        <input
          type="file"
          accept={fileConfig.accept}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          {file ? (
            <>
              <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-400 font-medium">{file.name}</p>
              <p className="text-gray-500 text-sm mt-1">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </>
          ) : (
            <>
              <Upload className={`w-12 h-12 mx-auto mb-2 transition-colors ${
                isDragging ? 'text-blue-500' : 'text-gray-500'
              }`} />
              <p className="text-gray-400">
                Glissez votre fichier ici ou <span className="text-blue-400">cliquez pour parcourir</span>
              </p>
              <p className="text-gray-600 text-sm mt-1">{fileConfig.accept}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Page d'accueil - Portail
function HomePage({ onSelectApp }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <FileSpreadsheet className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Portail de Traitement Excel
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Sélectionnez une application pour automatiser vos traitements de fichiers Excel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {APPS_CONFIG.map((app) => (
            <AppCard key={app.id} app={app} onClick={() => onSelectApp(app)} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            💡 Astuce : Tous les fichiers sont traités de manière sécurisée et supprimés immédiatement après traitement
          </p>
        </div>
      </div>
    </div>
  );
}

// Page de traitement d'une application
function AppProcessingPage({ app, onBack }) {
  const [files, setFiles] = useState({});
  const [params, setParams] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [funnyMessage, setFunnyMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (fileId, file) => {
    setFiles(prev => ({ ...prev, [fileId]: file }));
    setError(null);
  };

  const handleParamChange = (paramId, value) => {
    setParams(prev => ({ ...prev, [paramId]: value }));
  };

  const canProcess = () => {
    const allFilesUploaded = app.files.every(f => files[f.id]);
    const allParamsFilled = app.params.every(p => params[p.id]);
    return allFilesUploaded && allParamsFilled;
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    // Animation des messages amusants
    const messageInterval = setInterval(() => {
      setFunnyMessage(FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)]);
    }, 3000);

    try {
      // URL de l'API - utilise la variable d'environnement ou localhost par défaut
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      // Préparer FormData
      const formData = new FormData();
      
      // Ajouter les fichiers avec la bonne convention de nommage
      Object.entries(files).forEach(([key, file]) => {
        formData.append(`file_${key}`, file);
      });
      
      // Ajouter les paramètres
      formData.append('params', JSON.stringify(params));

      // Simulation de progression
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 500);

      // Appel API réel
      const response = await fetch(`${API_URL}/api/process/${app.id}`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      console.log('📡 Réponse reçue, status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ Erreur API complète:', JSON.stringify(errorData, null, 2));
        } catch {
          errorData = { detail: `Erreur HTTP ${response.status}` };
        }
        
        // Extraire le message d'erreur
        let errorMessage = 'Erreur lors du traitement';
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // FastAPI validation errors sont dans un tableau
            errorMessage = errorData.detail.map(err => {
              return `${err.loc ? err.loc.join(' > ') : ''}: ${err.msg}`;
            }).join('\n');
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Récupérer le nom du fichier depuis les headers de la réponse
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `resultat_${app.id}_${Date.now()}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      console.log('📄 Nom du fichier:', filename);

      const blob = await response.blob();
      console.log('💾 Blob reçu, taille:', blob.size, 'bytes');
      
      const url = window.URL.createObjectURL(blob);
      
      setProgress(100);
      setResult({
        url,
        filename
      });

      console.log('✅ Traitement terminé avec succès!');

    } catch (err) {
      console.error('Erreur complète:', err);
      
      // Mieux gérer l'affichage de l'erreur
      let errorMessage = 'Une erreur est survenue';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err.detail) {
        errorMessage = err.detail;
      }
      
      setError(errorMessage);
    } finally {
      clearInterval(messageInterval);
      setIsProcessing(false);
      setFunnyMessage('');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.filename;
    link.click();
  };

  const Icon = app.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Retour au portail
          </button>

          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${app.color}`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{app.name}</h1>
              <p className="text-gray-400 mt-1">{app.description}</p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl">
          {/* Upload de fichiers */}
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-blue-400" />
              Fichiers requis
            </h2>
            
            {app.files.map((fileConfig) => (
              <FileUploadZone
                key={fileConfig.id}
                fileConfig={fileConfig}
                file={files[fileConfig.id]}
                onFileChange={(file) => handleFileChange(fileConfig.id, file)}
              />
            ))}
          </div>

          {/* Paramètres */}
          {app.params.length > 0 && (
            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-400" />
                Paramètres
              </h2>
              
              {app.params.map((param) => (
                <div key={param.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    {param.label}
                  </label>
                  <input
                    type={param.type}
                    placeholder={param.placeholder}
                    value={params[param.id] || ''}
                    onChange={(e) => handleParamChange(param.id, e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Erreur</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Bouton de traitement */}
          <button
            onClick={handleProcess}
            disabled={!canProcess() || isProcessing}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 ${
              canProcess() && !isProcessing
                ? `bg-gradient-to-r ${app.color} hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50`
                : 'bg-gray-700 cursor-not-allowed opacity-50'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Lancer le traitement
              </>
            )}
          </button>

          {/* Barre de progression */}
          {isProcessing && (
            <div className="mt-6 space-y-3">
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-gray-400 text-sm italic animate-pulse">
                {funnyMessage}
              </p>
            </div>
          )}

          {/* Résultat */}
          {result && (
            <div className="mt-6 p-6 bg-green-500/10 border border-green-500/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-green-400 font-semibold">Traitement terminé !</p>
                    <p className="text-gray-400 text-sm mt-1">Votre fichier est prêt</p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  Télécharger
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Application principale
export default function ExcelProcessingPortal() {
  const [currentApp, setCurrentApp] = useState(null);

  return currentApp ? (
    <AppProcessingPage app={currentApp} onBack={() => setCurrentApp(null)} />
  ) : (
    <HomePage onSelectApp={setCurrentApp} />
  );
}
