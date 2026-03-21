'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Bookmark, 
    Plus, 
    X, 
    TrendingUp, 
    MapPin, 
    Truck 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const MOCK_FILTERS = [
    { id: '1', name: 'Mumbai Routes', icon: MapPin, count: 12, color: 'blue' },
    { id: '2', name: 'High Payload', icon: TrendingUp, count: 5, color: 'emerald' },
    { id: '3', name: 'Container Only', icon: Truck, count: 8, color: 'amber' },
];

export function SavedFilters() {
    const [activeId, setActiveId] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Saved Filters</h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-slate-100 rounded-lg">
                    <Plus className="h-3 w-3 text-slate-400" />
                </Button>
            </div>

            <div className="space-y-1">
                {MOCK_FILTERS.map((filter) => {
                    const isActive = activeId === filter.id;
                    return (
                        <motion.button
                            key={filter.id}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveId(isActive ? null : filter.id)}
                            className={cn(
                                "w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200 group text-left",
                                isActive ? "bg-slate-900 text-white shadow-lg" : "hover:bg-slate-50 text-slate-600"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-xl transition-colors",
                                    isActive ? "bg-white/10" : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                                )}>
                                    <filter.icon className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-bold tracking-tight">{filter.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={cn(
                                    "text-[10px] font-black border-none px-2 rounded-lg",
                                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                                )}>
                                    {filter.count}
                                </Badge>
                                {isActive && <X className="h-3 w-3 opacity-60" />}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <Button variant="outline" className="w-full h-12 rounded-2xl border-dashed border-2 border-slate-100 text-[10px] font-black text-slate-300 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/50 uppercase tracking-widest transition-all">
                + SAVE CURRENT SEARCH
            </Button>
        </div>
    );
}
