/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, HeartPulse, AlertTriangle, Trash2, Download, Upload, Activity } from 'lucide-react';
import { BloodPressureLog } from './types';
import { loadLogs, addLog, deleteLog } from './utils/storage';
import { exportToCSV, importFromCSV } from './utils/exportImport';

export default function App() {
  const [logs, setLogs] = useState<BloodPressureLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [notes, setNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLogs(loadLogs());
  }, []);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!systolic || !diastolic || !pulse) return;

    const newLog = addLog({
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      pulse: parseInt(pulse),
      notes
    });

    setLogs([...logs, newLog]);
    setSystolic('');
    setDiastolic('');
    setPulse('');
    setNotes('');
    
    setSelectedDate(new Date());
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que querés eliminar este registro?')) {
      deleteLog(id);
      setLogs(logs.filter(log => log.id !== id));
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFromCSV(file, () => {
        setLogs(loadLogs());
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
    }
  };

  const navigateDay = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isHighBP = (sys: number, dia: number) => sys > 140 || dia > 90;

  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate.getDate() === selectedDate.getDate() &&
           logDate.getMonth() === selectedDate.getMonth() &&
           logDate.getFullYear() === selectedDate.getFullYear();
  }).sort((a, b) => b.timestamp - a.timestamp);

  const formatDate = (date: Date) => {
    const today = new Date();
    if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
      return 'Hoy';
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
      return 'Ayer';
    }
    return date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="min-h-screen bg-[#0d0d12] text-slate-200 font-sans selection:bg-rose-500/30 relative pb-24">
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 10% 20%, rgba(255, 77, 77, 0.05) 0%, transparent 40%)' }}></div>

      <div className="max-w-md mx-auto px-4 pt-8 relative z-10">
        
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-rose-500/20 p-2 rounded-xl border border-rose-500/30">
              <HeartPulse className="w-6 h-6 text-rose-500" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              CardioTrack <span className="text-xs text-slate-500 font-normal ml-1">v1.0</span>
            </h1>
          </div>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-800 border border-white/5 transition-colors"
            title="Importar respaldo"
          >
            <Upload className="w-5 h-5 text-slate-400" />
          </button>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImport}
          />
        </header>

        <div className="flex items-center justify-between bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-2xl p-2 mb-6">
          <button onClick={() => navigateDay(-1)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium capitalize">{formatDate(selectedDate)}</span>
          <button onClick={() => navigateDay(1)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAddLog} className="bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-3xl p-5 mb-8 shadow-xl">
          <h2 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Nuevo Registro</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 ml-1">Sistólica (Alta)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  placeholder="120"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3 px-4 text-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                  required
                  min="50"
                  max="250"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">mmHg</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 ml-1">Diastólica (Baja)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  placeholder="80"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3 px-4 text-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                  required
                  min="30"
                  max="150"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">mmHg</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-slate-400 mb-1 ml-1">Pulsaciones</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Activity className="w-5 h-5 text-rose-500/70" />
              </div>
              <input 
                type="number" 
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="70"
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                required
                min="30"
                max="200"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">BPM</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs text-slate-400 mb-1 ml-1">Notas (Opcional)</label>
            <input 
              type="text" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Me sentí mareado..."
              className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-4 rounded-2xl transition-colors shadow-[0_0_20px_rgba(244,63,94,0.3)] active:scale-[0.98]"
          >
            Guardar Registro
          </button>
        </form>

        <div>
          <h2 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider ml-1">
            Registros del día
          </h2>
          
          {filteredLogs.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/30 border border-white/5 rounded-3xl border-dashed">
              <p className="text-slate-500 text-sm">No hay registros para este día.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map(log => {
                const isHigh = isHighBP(log.systolic, log.diastolic);
                return (
                  <div key={log.id} className="bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                          {new Date(log.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isHigh && (
                          <span className="flex items-center gap-1 text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            Alta
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-end gap-3 mt-2">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-2xl font-bold tracking-tight ${isHigh ? 'text-rose-400' : 'text-white'}`}>
                            {log.systolic}
                          </span>
                          <span className="text-slate-500 font-light text-xl">/</span>
                          <span className={`text-2xl font-bold tracking-tight ${isHigh ? 'text-rose-400' : 'text-white'}`}>
                            {log.diastolic}
                          </span>
                          <span className="text-slate-500 text-xs ml-1">mmHg</span>
                        </div>
                        
                        <div className="flex items-baseline gap-1 ml-2 pl-4 border-l border-white/10">
                          <span className="text-lg font-semibold text-slate-300">{log.pulse}</span>
                          <span className="text-slate-500 text-xs">BPM</span>
                        </div>
                      </div>

                      {log.notes && (
                        <p className="text-sm text-slate-400 mt-2 italic">"{log.notes}"</p>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(log.id)}
                      className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={exportToCSV}
        className="fixed bottom-6 right-6 bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-full shadow-lg border border-white/10 transition-transform hover:scale-105 active:scale-95 z-50 flex items-center justify-center"
        title="Exportar todos los registros"
      >
        <Download className="w-6 h-6" />
      </button>
    </div>
  );
}
