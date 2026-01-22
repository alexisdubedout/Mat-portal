import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, TrendingUp, Database, ArrowLeft, Calendar, Check, Loader2, Download, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

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

// Composant Card pour chaque processeur
function AppCard({ processor, onClick }) {
  // Mapping des icônes et couleurs selon le nom du processeur
  const getProcessorStyle = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('stock')) {
      return { Icon: FileSpreadsheet, color: 'from-blue-500 to-blue-600' };
    } else if (lowerName.includes('obso') || lowerName.includes('vente') || lowerName.includes('sale')) {
      return { Icon: TrendingUp, color: 'from-green-500 to-green-600' };
    } else if (lowerName.includes('merge') || lowerName.includes('fusion')) {
      return { Icon: Database, color: 'from-purple-500 to-purple-600' };
    }
    return { Icon: FileSpreadsheet, color: 'from-indigo-500 to-indigo-600' };
  };

  const { Icon, color } = getProcessorStyle(processor.name);

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 border border-gray-700 hover:border-blue-500/50"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {processor.name}
        </h3>
        
        <p className="text-gray-400 text-sm leading-relaxed">
          Cliquez pour traiter vos fichiers Excel
        </p>
      </div>
      
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-tl-full transform translate-x-16 translate-y-16 group-hover:translate-x-8 group-hover:translate-y-8 transition-transform duration-500"></div>
    </div>
  );
}

// Composant Zone de dépôt de fichier
function FileUploadZone({ file, onFileChange, label = "Fichier Excel" }) {
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
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
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
        {label}
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
          accept=".xlsx,.xls"
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
              <p className="text-gray-600 text-sm mt-1">.xlsx, .xls</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Page d'accueil - Portail
function HomePage({ processors, onSelectProcessor }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <FileSpreadsheet className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Web Apps Matériel
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Sélectionnez une application pour automatiser vos traitements de fichiers Excel
          </p>
        </div>

        {processors.length === 0 ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-gray-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Chargement des processeurs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processors.map((processor) => (
              <AppCard
                key={processor.id}
                processor={processor}
                onClick={() => onSelectProcessor(processor)}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            💡 Astuce : Tous les fichiers sont traités de manière sécurisée et supprimés immédiatement après traitement
          </p>
        </div>
      </div>
    </div>
  );
}

// Page de traitement d'un processeur
function ProcessingPage({ processor, onBack }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [funnyMessage, setFunnyMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const getProcessorStyle = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('stock')) {
      return { Icon: FileSpreadsheet, color: 'from-blue-500 to-blue-600' };
    } else if (lowerName.includes('obso') || lowerName.includes('vente') || lowerName.includes('sale')) {
      return { Icon: TrendingUp, color: 'from-green-500 to-green-600' };
    } else if (lowerName.includes('merge') || lowerName.includes('fusion')) {
      return { Icon: Database, color: 'from-purple-500 to-purple-600' };
    }
    return { Icon: FileSpreadsheet, color: 'from-indigo-500 to-indigo-600' };
  };

  const { Icon, color } = getProcessorStyle(processor.name);

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    // Animation des messages amusants
    const messageInterval = setInterval(() => {
      setFunnyMessage(FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)]);
    }, 3000);

    // Animation de progression
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await (`${API_URL}/api/process/${processor.id}`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors du traitement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      setProgress(100);
      setResult({
        url,
        filename: `processed_${file.name}`
      });

    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors du traitement');
    } finally {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      setIsProcessing(false);
      setFunnyMessage('');
    }
  };

  const handleDownload = () => {
    if (result) {
      const link = document.createElement('a');
      link.href = result.url;
      link.download = result.filename;
      link.click();
    }
  };

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
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${color}`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{processor.name}</h1>
              <p className="text-gray-400 mt-1">Traitement automatisé de fichiers Excel</p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl">
          {/* Upload de fichier */}
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-blue-400" />
              Fichier à traiter
            </h2>
            
            <FileUploadZone
              file={file}
              onFileChange={setFile}
              label="Sélectionnez votre fichier Excel"
            />
          </div>

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
            disabled={!file || isProcessing}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 ${
              file && !isProcessing
                ? `bg-gradient-to-r ${color} hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50`
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
export default function App() {
  const [processors, setProcessors] = useState([]);
  const [currentProcessor, setCurrentProcessor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProcessors();
  }, []);

  const fetchProcessors = async () => {
    try {
      const response = await fetch(`${API_URL}/api/treatments`);
      if (!response.ok) {
        throw new Error('Impossible de charger les traitements');
      }
      const data = await response.json();
      setProcessors(data.treatments || []); // <-- ici on prend "treatments" et non "processors"
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 font-medium mb-2">Erreur de connexion</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return currentProcessor ? (
    <ProcessingPage
      processor={currentProcessor}
      onBack={() => setCurrentProcessor(null)}
    />
  ) : (
    <HomePage
      processors={processors}
      onSelectProcessor={setCurrentProcessor}
    />
  );
}
