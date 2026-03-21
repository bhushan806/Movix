'use client';

import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  title: string;
  value: string | number;
  label: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'rose';
  isPriority?: boolean;
  onClick?: () => void;
}

export function InsightCard({ title, value, label, trend, icon: Icon, color = 'blue', isPriority = false, onClick }: InsightCardProps) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100"
  };

  const glowStyles = {
    blue: "shadow-blue-500/10",
    emerald: "shadow-emerald-500/10",
    amber: "shadow-amber-500/10",
    indigo: "shadow-indigo-500/10",
    rose: "shadow-rose-500/10"
  };

  return (
    <Card 
      onClick={onClick}
      className={cn(
        "group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] bg-white overflow-hidden relative cursor-pointer active:scale-[0.98]",
        isPriority ? `border-2 border-${color}-100 ring-4 ring-${color}-50/50` : ""
      )}
    >
      {isPriority && (
        <div className={cn("absolute top-0 left-0 right-0 h-1", `bg-${color}-500 opacity-50`)} />
      )}
      
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className={cn("p-4 rounded-2xl shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3", colorStyles[color])}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <div className={cn("flex items-center gap-1 font-black text-xs px-3 py-1.5 rounded-full",
              trend.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              {trend.isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {trend.value}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
            <span className="text-sm font-bold text-slate-400 capitalize">{label}</span>
          </div>
        </div>

        {/* Mini Sparkline Mockup */}
        <div className="mt-8 flex items-end gap-1.5 h-12">
            {[40, 70, 45, 90, 65, 80, 50, 85, 95, 75, 60, 85].map((h, i) => (
                <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className={cn("w-full rounded-t-sm opacity-20 group-hover:opacity-40 transition-opacity", 
                      color === 'blue' ? "bg-blue-600" : 
                      color === 'emerald' ? "bg-emerald-600" : 
                      color === 'amber' ? "bg-amber-600" : 
                      color === 'indigo' ? "bg-indigo-600" : "bg-rose-600"
                    )}
                />
            ))}
        </div>
      </div>
    </Card>
  );
}
