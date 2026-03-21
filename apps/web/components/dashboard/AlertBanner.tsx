'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight, ShieldAlert, Wrench, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AlertBannerProps {
  type: 'warning' | 'critical' | 'info' | 'maintenance';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AlertBanner({ type, message, actionLabel, onAction }: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const styles: Record<string, string> = {
    critical: "bg-red-50 border-red-100 text-red-900",
    warning: "bg-amber-50 border-amber-100 text-amber-900",
    info: "bg-blue-50 border-blue-100 text-blue-900",
    maintenance: "bg-orange-50 border-orange-100 text-orange-900"
  };

  const icons: Record<string, any> = {
    critical: ShieldAlert,
    warning: AlertCircle,
    info: AlertCircle,
    maintenance: Wrench
  };

  const Icon = icons[type] || AlertCircle;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`w-full p-4 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 ${styles[type]}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${
            type === 'critical' ? 'bg-red-100 text-red-600' : 
            type === 'warning' ? 'bg-amber-100 text-amber-600' : 
            type === 'maintenance' ? 'bg-orange-100 text-orange-600' :
            'bg-blue-100 text-blue-600'}`}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold tracking-tight">{message}</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {actionLabel && (
            <Button 
               size="sm" 
               onClick={onAction}
               className={`h-10 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                 type === 'critical' ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200' : 
                 type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-200' : 
                 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
               }`}
            >
              {actionLabel} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-black/5 rounded-full transition-colors hidden sm:block"
          >
            <X className="h-4 w-4 opacity-50" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
