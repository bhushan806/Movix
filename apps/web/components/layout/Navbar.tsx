'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Truck, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// NavItems extracted outside Navbar to avoid "cannot create components during render" error
function NavItems({ user, onClick }: { user: any, onClick?: () => void }) {
    return (
        <>
            {!user && (
                <>
                    <Link href="/find-vehicle" onClick={onClick} className="text-sm font-medium transition-colors hover:text-primary">Find Vehicle</Link>
                    <Link href="/rules" onClick={onClick} className="text-sm font-medium transition-colors hover:text-primary">Road Rules</Link>
                </>
            )}

            {user?.role === 'CUSTOMER' && (
                <>
                    <Link href="/dashboard/customer" onClick={onClick} className="text-sm font-medium text-primary hover:text-primary/80">Dashboard</Link>
                    <Link href="/find-vehicle" onClick={onClick} className="text-sm font-medium transition-colors hover:text-primary">Track Shipment</Link>
                </>
            )}

            {user?.role === 'DRIVER' && (
                <>
                    <Link href="/dashboard/driver" onClick={onClick} className="text-sm font-medium text-primary hover:text-primary/80">Driver Console</Link>
                    <Link href="/rules" onClick={onClick} className="text-sm font-medium transition-colors hover:text-primary">Safety Rules</Link>
                </>
            )}

            {user?.role === 'OWNER' && (
                <>
                    <Link href="/dashboard/owner" onClick={onClick} className="text-sm font-medium text-primary hover:text-primary/80">Fleet Manager</Link>
                    <Link href="/dashboard/owner/finance" onClick={onClick} className="text-sm font-medium transition-colors hover:text-primary">Finance</Link>
                    <Link href="/dashboard/owner/loads" onClick={onClick} className="text-sm font-medium transition-colors hover:text-primary">Find Loads</Link>
                    <Link href="/dashboard/owner/analytics" onClick={onClick} className="text-sm font-medium transition-colors hover:text-primary">Analytics</Link>
                </>
            )}
        </>
    );
}

export function Navbar() {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                scrolled
                    ? "py-3 bg-white/70 backdrop-blur-xl shadow-lg shadow-blue-500/5 border-b border-blue-100/50"
                    : "py-5 bg-transparent border-b border-transparent"
            )}
        >
            <div className="container flex max-w-screen-2xl items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <motion.div
                        whileHover={{ rotate: -10, scale: 1.1 }}
                        className="p-2 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20"
                    >
                        <Truck className="h-6 w-6 text-white" />
                    </motion.div>
                    <span className="font-bold text-xl tracking-tight text-slate-900">
                        TruckNet<span className="text-blue-600"> India</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <NavItems user={user} />
                </nav>

                {/* Actions & Mobile Toggle */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-slate-600 hidden lg:block">
                                {user.name}
                            </span>
                            <Button variant="ghost" size="sm" onClick={logout} className="rounded-xl font-semibold hover:bg-red-50 hover:text-red-600 transition-colors">
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-3">
                            <Link href="/auth/login">
                                <Button variant="ghost" className="font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-xl px-6 font-semibold transition-all hover:scale-105 active:scale-95">
                                    Join Now
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <Button variant="ghost" size="icon" className="md:hidden rounded-lg hover:bg-slate-100" onClick={toggleMenu}>
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b overflow-hidden shadow-2xl"
                    >
                        <div className="container py-8 px-4 flex flex-col gap-6">
                            <nav className="flex flex-col gap-4">
                                <NavItems user={user} onClick={() => setIsMobileMenuOpen(false)} />
                            </nav>
                            <div className="pt-4 flex flex-col gap-3">
                                {user ? (
                                    <Button variant="destructive" onClick={logout} className="w-full rounded-xl">
                                        Logout
                                    </Button>
                                ) : (
                                    <>
                                        <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full rounded-xl">Log in</Button>
                                        </Link>
                                        <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">Join Now</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
