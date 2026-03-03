import { BloodPressureLog } from '../types';
import { loadLogs, saveLogs } from './storage';

export const exportToCSV = () => {
  const logs = loadLogs();
  if (logs.length === 0) {
    alert('No hay registros para exportar.');
    return;
  }

  const headers = ['ID', 'Fecha', 'Hora', 'Sistólica', 'Diastólica', 'Pulsaciones', 'Notas'];
  const rows = logs.map(log => {
    const date = new Date(log.timestamp);
    const dateString = date.toLocaleDateString('es-AR');
    const timeString = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    return [
      log.id,
      dateString,
      timeString,
      log.systolic,
      log.diastolic,
      log.pulse,
      `"${log.notes.replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `presion_arterial_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importFromCSV = (file: File, onComplete: () => void) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target?.result as string;
    if (!text) return;

    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
      alert('El archivo parece estar vacío o no tiene el formato correcto.');
      return;
    }

    const currentLogs = loadLogs();
    const newLogs: BloodPressureLog[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Match CSV columns considering quotes
      const match = line.match(/([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),(.*)/);
      
      if (match) {
        const [_, id, dateStr, timeStr, sys, dia, pulse, notesRaw] = match;
        
        const isDuplicate = currentLogs.some(log => log.id === id) || newLogs.some(log => log.id === id);
        
        if (!isDuplicate) {
          const [day, month, year] = dateStr.split('/');
          const [hour, minute] = timeStr.split(':');
          
          const timestamp = new Date(
            parseInt(year), 
            parseInt(month) - 1, 
            parseInt(day), 
            parseInt(hour), 
            parseInt(minute)
          ).getTime();

          let notes = notesRaw;
          if (notes.startsWith('"') && notes.endsWith('"')) {
            notes = notes.substring(1, notes.length - 1).replace(/""/g, '"');
          }

          newLogs.push({
            id: id || crypto.randomUUID(),
            timestamp: isNaN(timestamp) ? Date.now() : timestamp,
            systolic: parseInt(sys),
            diastolic: parseInt(dia),
            pulse: parseInt(pulse),
            notes: notes || ''
          });
        }
      }
    }

    if (newLogs.length > 0) {
      saveLogs([...currentLogs, ...newLogs]);
      alert(`Se importaron ${newLogs.length} registros exitosamente.`);
      onComplete();
    } else {
      alert('No se encontraron registros nuevos para importar.');
    }
  };
  reader.readAsText(file);
};
