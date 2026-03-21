'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Search, 
    Truck, 
    MapPin, 
    TrendingUp, 
    History, 
    Command, 
    User, 
    ChevronRight,
    ArrowRight,
    Plus,
    X
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useUX } from '@/lib/ux-context';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const NAVIGATION: PaletteItem[] = [
    { id: 'dash', label: 'Dashboard', icon: Command, path: '/dashboard/owner', category: 'Navigation', shortcut: 'G D' },
    { id: 'v', label: 'My Vehicles', icon: Truck, path: '/dashboard/owner/vehicles', category: 'Navigation', shortcut: 'G V' },
    { id: 'l', label: 'Load Marketplace', icon: MapPin, path: '/dashboard/owner/loads', category: 'Navigation', shortcut: 'G L' },
    { id: 'f', label: 'Finance & Payments', icon: TrendingUp, path: '/dashboard/owner/finance', category: 'Navigation' },
];

const ACTIONS: PaletteItem[] = [
    { id: 'add-v', label: 'Register New Vehicle', icon: Plus, path: '/dashboard/owner/vehicles/add', category: 'Actions' },
    { id: 'post-l', label: 'Post a New Load', icon: Plus, path: '/dashboard/owner/loads/post', category: 'Actions' },
];

interface PaletteItem {
    id: string;
    label: string;
    icon: any;
    path: string;
    category: string;
    shortcut?: string;
}

export function CommandPalette() {
    const { isCommandPaletteOpen, setIsCommandPaletteOpen, recentPages } = useUX();
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const filteredItems = useMemo(() => {
        const query = search.toLowerCase();
        const allItems: PaletteItem[] = [
            ...NAVIGATION,
            ...ACTIONS,
            ...recentPages.map(p => ({
                id: p,
                label: p.split('/').pop()?.replace('-', ' ') || 'Recent Page',
                icon: History,
                path: p,
                category: 'Recent'
            }))
        ];

        return allItems.filter(item => 
            item.label.toLowerCase().includes(query) || 
            item.category.toLowerCase().includes(query)
        );
    }, [search, recentPages]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    const handleSelect = (path: string) => {
        router.push(path);
        setIsCommandPaletteOpen(false);
        setSearch('');
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isCommandPaletteOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredItems.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredItems[selectedIndex]) {
                    handleSelect(filteredItems[selectedIndex].path);
                }
            } else if (e.key === 'Escape') {
                setIsCommandPaletteOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCommandPaletteOpen, selectedIndex, filteredItems, router]);

    return (
        <Dialog open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen}>
            <DialogContent className="max-w-2xl p-0 border-none shadow-2xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <DialogTitle className="sr-only">Command Palette</DialogTitle>
                <DialogDescription className="sr-only">
                    Search for navigation pages, actions, and recent records.
                </DialogDescription>
                <div className="flex flex-col h-[500px]">
                    {/* Search Bar */}
                    <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                        <Search className="h-6 w-6 text-slate-400" />
                        <input 
                            autoFocus
                            aria-label="Search pages and actions"
                            placeholder="Search everything... (G D for Dashboard, G V for Vehicles)"
                            className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-bold text-slate-900 placeholder:text-slate-300"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                             <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-slate-50 px-1.5 font-mono text-[10px] font-black text-slate-500">
                                ESC
                             </kbd>
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                                <Search className="h-12 w-12 opacity-10" />
                                <p className="font-bold">No results found for "{search}"</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {['Navigation', 'Actions', 'Recent'].map((cat) => {
                                    const catItems = filteredItems.filter(i => i.category === cat);
                                    if (catItems.length === 0) return null;

                                    return (
                                        <div key={cat} className="space-y-2">
                                            <h4 className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{cat}</h4>
                                            <div className="space-y-1">
                                                {catItems.map((item, idx) => {
                                                    const actualIdx = filteredItems.indexOf(item);
                                                    const isSelected = actualIdx === selectedIndex;

                                                    return (
                                                        <motion.button
                                                            key={item.id}
                                                            whileHover={{ x: 4 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => handleSelect(item.path)}
                                                            aria-label={`Navigate to ${item.label}`}
                                                            className={cn(
                                                                "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group",
                                                                isSelected ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "hover:bg-slate-50 text-slate-600"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn(
                                                                    "p-2 rounded-xl transition-colors",
                                                                    isSelected ? "bg-white/20" : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                                                                )}>
                                                                    <item.icon className="h-5 w-5" />
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="font-black text-sm tracking-tight capitalize">{item.label}</p>
                                                                    <p className={cn("text-[10px] font-medium opacity-60", isSelected ? "text-white" : "text-slate-400")}>{item.path}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {item.shortcut && (
                                                                    <div className={cn("flex items-center gap-1 px-2 py-1 rounded-md bg-black/5 font-mono text-[10px] font-black", 
                                                                        isSelected ? "bg-white/20 text-white" : "text-slate-300")}>
                                                                        {item.shortcut}
                                                                    </div>
                                                                )}
                                                                <ChevronRight className={cn("h-4 w-4 transition-transform", isSelected ? "translate-x-1" : "opacity-0 group-hover:opacity-100")} />
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3" /> Select</span>
                            <span className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3 rotate-90" /> Navigate</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <Command className="h-3 w-3" />
                             <span>TRUCKNET COMMAND</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
