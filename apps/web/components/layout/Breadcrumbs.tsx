'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname?.split('/').filter(Boolean) || [];

    return (
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none pb-1 md:pb-0">
            <Link 
                href="/dashboard" 
                className="hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
                <Home className="h-3.5 w-3.5" />
                <span className="sr-only md:not-sr-only">Home</span>
            </Link>
            
            {segments.map((segment, index) => {
                const href = `/${segments.slice(0, index + 1).join('/')}`;
                const isLast = index === segments.length - 1;
                const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

                return (
                    <React.Fragment key={href}>
                        <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
                        {isLast ? (
                            <span className="text-slate-900 font-bold truncate max-w-[120px] md:max-w-none">
                                {label}
                            </span>
                        ) : (
                            <Link 
                                href={href} 
                                className="hover:text-blue-600 transition-colors truncate max-w-[100px] md:max-w-none"
                            >
                                {label}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
