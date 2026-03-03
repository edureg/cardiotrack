import { BloodPressureLog } from '../types';

const STORAGE_KEY = 'bp_tracker_logs';

export const loadLogs = (): BloodPressureLog[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading logs:', error);
    return [];
  }
};

export const saveLogs = (logs: BloodPressureLog[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving logs:', error);
  }
};

export const addLog = (log: Omit<BloodPressureLog, 'id' | 'timestamp'>): BloodPressureLog => {
  const logs = loadLogs();
  const newLog: BloodPressureLog = {
    ...log,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  saveLogs([...logs, newLog]);
  return newLog;
};

export const deleteLog = (id: string): void => {
  const logs = loadLogs();
  saveLogs(logs.filter(log => log.id !== id));
};
