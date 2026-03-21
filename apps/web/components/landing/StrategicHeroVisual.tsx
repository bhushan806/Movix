'use client';

import { motion } from 'framer-motion';
import { MapPin, Truck, ShieldCheck, Zap } from 'lucide-react';

const HUBS = [
  { name: 'Delhi', x: '45%', y: '25%', delay: 0 },
  { name: 'Mumbai', x: '35%', y: '65%', delay: 0.2 },
  { name: 'Bangalore', x: '48%', y: '85%', delay: 0.4 },
  { name: 'Kolkata', x: '75%', y: '50%', delay: 0.6 },
  { name: 'Hyderabad', x: '50%', y: '65%', delay: 0.8 },
];

export function StrategicHeroVisual() {
  return (
    <div className="relative w-full aspect-[4/3] max-w-2xl mx-auto lg:mx-0 rounded-[2.5rem] bg-slate-900 overflow-hidden shadow-2xl border-8 border-slate-800/50 p-6 flex flex-col group">
      {/* Background Tech Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-600/20">
            <Zap className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">Fleet Intelligence</h4>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">System Online</p>
            </div>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 text-[10px] font-bold tracking-widest uppercase">
          Live Hub
        </div>
      </div>

      {/* Stylized Map View (Represented by a dot grid map of India shape) */}
      <div className="flex-1 relative flex items-center justify-center">
        <div className="relative w-full h-full max-h-[400px]">
          {/* Stylized "India" shape - Abstract dot grid */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-[60%] h-[80%] bg-blue-500/10 blur-3xl rounded-full animate-pulse" />
          </div>

          {/* Hub Points */}
          {HUBS.map((hub, idx) => (
            <motion.div
              key={hub.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: hub.delay + 1, duration: 0.5 }}
              style={{ left: hub.x, top: hub.y }}
              className="absolute z-20 group/hub"
            >
              <div className="relative">
                <span className="absolute inset-0 -m-3 rounded-full bg-blue-500/20 animate-ping opacity-75" />
                <div className="relative h-4 w-4 rounded-full bg-blue-600 border-2 border-slate-900 shadow-lg shadow-blue-600/40" />
                
                {/* Hub Label */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[9px] font-bold text-white opacity-0 group-hover/hub:opacity-100 transition-opacity pointer-events-none uppercase tracking-wider">
                  {hub.name}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Connecting Lines (Representative) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-30">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
                d="M 150 150 L 350 300"
                stroke="url(#lineGrad)"
                strokeWidth="2"
                strokeDasharray="10 20"
                animate={{ strokeDashoffset: [0, -100] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </div>
      </div>

      {/* Floating Status Cards */}
      <div className="grid grid-cols-2 gap-4 mt-auto relative z-10">
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
        >
          <div className="flex items-center gap-3 mb-1">
            <Truck className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fleet Active</span>
          </div>
          <div className="text-xl font-bold text-white tracking-tight">12,482 <span className="text-[10px] text-emerald-500 ml-1">+12%</span></div>
        </motion.div>

        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.7 }}
            className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
        >
          <div className="flex items-center gap-3 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Deliveries</span>
          </div>
          <div className="text-xl font-bold text-white tracking-tight">98.4% <span className="text-slate-500 font-medium text-xs ml-1">On-time</span></div>
        </motion.div>
      </div>

      {/* Bottom Overlay Shine */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-600/10 to-transparent pointer-events-none" />
    </div>
  );
}
