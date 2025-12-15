import React, { useRef, useState } from 'react';
import { Upload, FileJson, RefreshCw, Database } from 'lucide-react';
import { FixedData, WeeklyReport } from '../types';

interface SettingsProps {
  onDataLoaded: (fixed: FixedData[], weekly: WeeklyReport[]) => void;
  onReset: () => void;
}

export const SettingsView: React.FC<SettingsProps> = ({ onDataLoaded, onReset }) => {
  const [fixedFile, setFixedFile] = useState<File | null>(null);
  const [weeklyFile, setWeeklyFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFiles = async () => {
    if (!fixedFile || !weeklyFile) {
      setError("Por favor selecciona ambos archivos JSON.");
      return;
    }

    setLoading(true);
    setError(null);

    const readFile = (file: File): Promise<any> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const json = JSON.parse(e.target?.result as string);
            resolve(json);
          } catch (err) {
            reject(`Error al leer ${file.name}: Formato JSON inválido.`);
          }
        };
        reader.onerror = () => reject(`Error leyendo ${file.name}`);
        reader.readAsText(file);
      });
    };

    try {
      const [fixedData, weeklyData] = await Promise.all([
        readFile(fixedFile),
        readFile(weeklyFile)
      ]);

      // Basic validation
      if (!Array.isArray(fixedData) || !Array.isArray(weeklyData)) {
        throw new Error("Los archivos deben contener arrays JSON.");
      }

      onDataLoaded(fixedData, weeklyData);
    } catch (err: any) {
      setError(err.message || "Error desconocido al procesar archivos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Configuración de Datos</h2>
        <p className="text-slate-500">Carga los archivos JSON fuente para actualizar el dashboard.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUploadZone 
            label="Datos Fijos (Preguntas)" 
            file={fixedFile} 
            setFile={setFixedFile} 
            color="border-blue-300 bg-blue-50"
          />
          <FileUploadZone 
            label="Reporte Semanal" 
            file={weeklyFile} 
            setFile={setWeeklyFile} 
            color="border-emerald-300 bg-emerald-50"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 gap-4">
          <button 
             onClick={onReset}
             className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Cargar Datos de Ejemplo
          </button>
          <button
            onClick={processFiles}
            disabled={loading || !fixedFile || !weeklyFile}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {loading ? 'Procesando...' : (
              <>
                <Database size={18} />
                Procesar y Visualizar
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="bg-slate-100 p-6 rounded-lg text-sm text-slate-600">
        <h4 className="font-bold mb-2">Instrucciones:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>El archivo <strong>Fijo</strong> debe contener: <code>id, item, autoridad, texto_pregunta</code>.</li>
          <li>El archivo <strong>Semanal</strong> debe contener: <code>correlativo, tematica, subcontrato, revisor, estado, fecha_entrega, semana</code>.</li>
          <li>El sistema cruzará los datos automáticamente usando <code>id</code> y <code>correlativo</code>.</li>
        </ul>
      </div>
    </div>
  );
};

const FileUploadZone = ({ label, file, setFile, color }: any) => {
  return (
    <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${file ? 'border-emerald-500 bg-emerald-50' : color}`}>
      <input
        type="file"
        accept=".json"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center pointer-events-none">
        {file ? (
          <>
            <FileJson className="w-10 h-10 text-emerald-600 mb-2" />
            <p className="font-semibold text-emerald-900 truncate max-w-full px-2">{file.name}</p>
            <p className="text-xs text-emerald-600">{(file.size / 1024).toFixed(1)} KB</p>
          </>
        ) : (
          <>
            <Upload className="w-10 h-10 text-slate-400 mb-2" />
            <p className="font-medium text-slate-700">{label}</p>
            <p className="text-xs text-slate-500 mt-1">Click o arrastrar JSON</p>
          </>
        )}
      </div>
    </div>
  );
}
