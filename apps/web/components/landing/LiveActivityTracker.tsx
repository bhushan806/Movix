'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, UserPlus, CheckCircle2 } from 'lucide-react';

const ACTIVITIES = [
  { id: 1, type: 'LOAD', text: 'New Load: Mumbai → Delhi', time: 'Just now', icon: Truck, color: 'text-blue-500' },
  { id: 2, type: 'DRIVER', text: 'Driver "Rajesh K." joined the platform', time: '2m ago', icon: UserPlus, color: 'text-emerald-500' },
  { id: 3, type: 'DELIVERY', text: 'Handover complete: Pune Central', time: '5m ago', icon: CheckCircle2, color: 'text-blue-600' },
  { id: 4, type: 'LOAD', text: 'New Load: Bangalore → Hyderabad', time: '8m ago', icon: Truck, color: 'text-blue-500' },
  { id: 5, type: 'LOCATION', text: 'Vehicle MH-12-AB-1234 reached Jaipur', time: '12m ago', icon: MapPin, color: 'text-amber-500' },
];

export function LiveActivityTracker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ACTIVITIES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const active = ACTIVITIES[index];

  return (
    <div className="inline-flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-slate-200/50 px-4 py-2 rounded-full shadow-sm">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
        <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        Live Fleet
      </div>

      <div className="h-3 w-px bg-slate-200" />

      <div className="flex items-center gap-2 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <active.icon className={`w-3.5 h-3.5 ${active.color}`} />
            <span className="text-xs font-semibold text-slate-600">
              {active.text}
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              {active.time}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
