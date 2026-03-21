'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useUX } from '@/lib/ux-context';
import {
    Truck,
    LayoutDashboard,
    MapPin,
    FileText,
    Users,
    BarChart3,
    LogOut,
    Settings,
    ShieldAlert,
    History,
    Search,
    Command
} from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { recentPages, setIsCommandPaletteOpen } = useUX();

    if (!user) return null;

    const roleLinks = {
        CUSTOMER: [
            { href: '/dashboard/customer', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/find-vehicle', label: 'Track Shipment', icon: MapPin },
        ],
        DRIVER: [
            { href: '/dashboard/driver', label: 'Driver Console', icon: LayoutDashboard },
            { href: '/dashboard/driver/roadside', label: 'Roadside Help', icon: Truck },
        ],
        OWNER: [
            { href: '/dashboard/owner', label: 'Fleet Manager', icon: LayoutDashboard, shortcut: 'G D' },
            { href: '/dashboard/owner/vehicles', label: 'My Vehicles', icon: Truck, shortcut: 'G V' },
            { href: '/dashboard/owner/loads', label: 'Marketplace', icon: MapPin, shortcut: 'G L', hasUpdate: true },
            { href: '/dashboard/owner/find-drivers', label: 'Find Drivers', icon: Users },
            { href: '/dashboard/owner/analytics', label: 'Analytics', icon: BarChart3 },
            { href: '/rules', label: 'Safety Rules', icon: ShieldAlert },
        ],
        ADMIN: []
    };

    const links = roleLinks[user.role as keyof typeof roleLinks] || [];

    return (
        <div className={cn("flex flex-col h-full border-r bg-white", className)}>
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                <Link href="/dashboard" className="flex items-center gap-3 px-2 mb-8 group">
                    <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors shadow-sm">
                        <Truck className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">TruckNet <span className="text-blue-600">India</span></h2>
                </Link>

                <div className="space-y-6">
                    <div>
                        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Main Menu</p>
                        <nav className="space-y-1">
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link key={link.href} href={link.href} aria-label={link.label}>
                                        <Button
                                            variant="ghost"
                                            id={link.label === 'Fleet Manager' ? 'fleet-command-link' : undefined}
                                            className={cn(
                                                "w-full justify-start gap-3 px-4 py-6 rounded-xl transition-all duration-200 relative group",
                                                isActive
                                                    ? "bg-blue-50 text-blue-600 font-bold shadow-sm hover:bg-blue-100 hover:text-blue-700"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                        >
                                            <link.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-slate-400")} />
                                            <span className="text-[15px] flex-1 text-left">{link.label}</span>

                                            {(link as any).hasUpdate && (
                                                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                            )}

                                            {(link as any).shortcut && (
                                                <span className="hidden group-hover:block ml-auto text-[10px] font-black text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded uppercase tabular-nums">
                                                    {(link as any).shortcut}
                                                </span>
                                            )}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {recentPages.length > 0 && (
                        <div>
                            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <History className="h-3 w-3" />
                                Recent
                            </p>
                            <nav className="space-y-1">
                                {recentPages.map((page) => (
                                    <Link key={page} href={page}>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-3 px-4 py-3 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 group"
                                        >
                                            <FileText className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
                                            <span className="text-xs font-medium truncate">{page.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Dashboard'}</span>
                                        </Button>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 space-y-4">
                {/* Search / Command Hint (Desktop) */}
                <button
                    onClick={() => setIsCommandPaletteOpen(true)}
                    className="hidden md:flex w-full items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 group"
                >
                    <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        <span className="text-xs font-medium">Quick search</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 group-hover:text-slate-400">
                        <Command className="h-2.5 w-2.5" />
                        <span>K</span>
                    </div>
                </button>

                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                        {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs font-medium text-slate-500 truncate capitalize">{user.role.toLowerCase()}</p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    className="w-full justify-start gap-3 px-4 py-5 rounded-xl text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200"
                    onClick={logout}
                >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Sign Out</span>
                </Button>
            </div>
        </div>
    );
}
