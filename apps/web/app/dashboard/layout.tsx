'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { useState } from 'react';
import { Menu, Search, Bell, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useUX } from '@/lib/ux-context';
import { PageTransition } from '@/components/layout/PageTransition';
import { CommandPalette } from '@/components/layout/CommandPalette';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { setIsCommandPaletteOpen } = useUX();

    return (
        <div className="flex min-h-screen w-full bg-slate-50">
            {/* Desktop Sidebar */}
            <div className="hidden border-r bg-white md:block md:w-72 fixed h-full z-30 shadow-sm">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}
            {isMobileMenuOpen && (
                <div className="fixed inset-y-0 left-0 z-50 w-72 border-r bg-white transition-transform md:hidden shadow-xl overflow-y-auto">
                    <Sidebar />
                </div>
            )}

            <div className="flex flex-col w-full md:pl-72">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-4 md:px-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-slate-600 hover:bg-slate-100"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                    
                    <div className="flex-1 flex items-center justify-between gap-4">
                        <div className="hidden md:block flex-shrink-0">
                             <Breadcrumbs />
                        </div>

                        {/* Intelligent Search Input */}
                        <div className="flex-1 max-w-md relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search everything..."
                                onClick={() => setIsCommandPaletteOpen(true)}
                                readOnly
                                className="w-full bg-slate-100/50 border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-100 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 transition-all cursor-pointer"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                <Command className="h-2.5 w-2.5" />
                                <span>K</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                             <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600 relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                             </Button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8">
                    <div className="md:hidden mb-4">
                        <Breadcrumbs />
                    </div>
                    <PageTransition>
                        {children}
                    </PageTransition>
                </main>
            </div>
            
            {/* Global Navigation Hub */}
            <CommandPalette />
        </div>
    );
}
