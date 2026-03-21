'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface UXContextType {
    onboardingComplete: boolean;
    setOnboardingComplete: (val: boolean) => void;
    isTourOpen: boolean;
    setIsTourOpen: (val: boolean) => void;
    currentTourStep: number;
    setCurrentTourStep: (step: number) => void;
    demoDataEnabled: boolean;
    setDemoDataEnabled: (val: boolean) => void;
    isCommandPaletteOpen: boolean;
    setIsCommandPaletteOpen: (val: boolean) => void;
    recentPages: string[];
    addRecentPage: (page: string) => void;
}

const UXContext = createContext<UXContextType | undefined>(undefined);

export function UXProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [currentTourStep, setCurrentTourStep] = useState(0);
    const [demoDataEnabled, setDemoDataEnabled] = useState(true);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [recentPages, setRecentPages] = useState<string[]>([]);
    const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('onboarding_complete');
        if (stored === 'true') {
            setOnboardingComplete(true);
        } else {
            // Start tour for new users after a short delay
            setTimeout(() => setIsTourOpen(true), 2000);
        }
        
        const storedRecent = localStorage.getItem('recent_pages');
        if (storedRecent) setRecentPages(JSON.parse(storedRecent));
    }, []);

    const updateOnboarding = (val: boolean) => {
        setOnboardingComplete(val);
        localStorage.setItem('onboarding_complete', val.toString());
        if (val) setIsTourOpen(false);
    };

    const addRecentPage = (page: string) => {
        setRecentPages(prev => {
            const filtered = prev.filter(p => p !== page);
            const updated = [page, ...filtered].slice(0, 5);
            localStorage.setItem('recent_pages', JSON.stringify(updated));
            return updated;
        });
    };

    // Track path changes for recent pages
    useEffect(() => {
        if (pathname && pathname !== '/') {
            addRecentPage(pathname);
        }
    }, [pathname]);

    // Global keyboard shortcuts (Chords)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Disable shortcuts if typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            // Command Palette (Ctrl+K)
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
                return;
            }

            // G-Chord Shortcuts
            if (e.key.toLowerCase() === 'g') {
                setLastKeyPressed('g');
                // Reset chord after 1 second
                setTimeout(() => setLastKeyPressed(null), 1000);
            } else if (lastKeyPressed === 'g') {
                const key = e.key.toLowerCase();
                if (key === 'v') router.push('/dashboard/owner/vehicles');
                if (key === 'l') router.push('/dashboard/owner/loads');
                if (key === 'd') router.push('/dashboard/owner');
                setLastKeyPressed(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lastKeyPressed, router]);

    return (
        <UXContext.Provider value={{
            onboardingComplete,
            setOnboardingComplete: updateOnboarding,
            isTourOpen,
            setIsTourOpen,
            currentTourStep,
            setCurrentTourStep,
            demoDataEnabled,
            setDemoDataEnabled,
            isCommandPaletteOpen,
            setIsCommandPaletteOpen,
            recentPages,
            addRecentPage
        }}>
            {children}
        </UXContext.Provider>
    );
}

export const useUX = () => {
    const context = useContext(UXContext);
    if (context === undefined) {
        throw new Error('useUX must be used within a UXProvider');
    }
    return context;
};
