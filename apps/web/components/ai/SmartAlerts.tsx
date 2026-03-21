'use client';
import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface Alert {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
}

export function SmartAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Demo: Add a fake alert after a few seconds to show proactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      addAlert({
        message: "High congestion expected on NH-48 (+45 mins). Suggesting alternate route.",
        type: "warning"
      });
    }, 8000); // Appear after 8 seconds for visual effect
    
    return () => clearTimeout(timer);
  }, []);

  const addAlert = (alert: Omit<Alert, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setAlerts(prev => [...prev, { ...alert, id }]);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
      removeAlert(id);
    }, 10000);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-[9900] flex flex-col gap-3 w-[320px] pointer-events-none">
      {alerts.map(alert => (
        <div 
          key={alert.id}
          className={`pointer-events-auto p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border flex gap-3 items-start animate-in slide-in-from-right-8 fade-in duration-300 ${
            alert.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
            alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
            'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${
            alert.type === 'warning' ? 'text-amber-500' :
            alert.type === 'success' ? 'text-emerald-500' :
            'text-blue-500'
          }`} />
          <p className="text-sm flex-1 leading-snug font-medium">{alert.message}</p>
          <button 
            onClick={() => removeAlert(alert.id)}
            className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
