'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Globe, Gauge } from 'lucide-react';
import { StrategicHeroVisual } from './StrategicHeroVisual';
import { LiveActivityTracker } from './LiveActivityTracker';
import { useRef } from 'react';

export function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // Parallax effects
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <section ref={containerRef} className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-slate-50 pt-20 pb-32">
            {/* Background Decorative Elements */}
            <motion.div
                style={{ y: y1 }}
                className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 blur-[120px] rounded-full -z-10"
            />
            <motion.div
                style={{ y: y2 }}
                className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/30 blur-[100px] rounded-full -z-10"
            />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col space-y-8"
                    >
                        <div className="space-y-4">
                            <div className="flex justify-center lg:justify-start">
                                <LiveActivityTracker />
                            </div>

                            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] text-slate-900 text-center lg:text-left">
                                Reliable <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Logistics</span> <br />
                                for India.
                            </h1>

                            <p className="max-w-[540px] text-slate-600 text-lg md:text-xl leading-relaxed font-medium text-center lg:text-left mx-auto lg:mx-0">
                                The simplest platform to book trucks and manage your fleet. Fast, transparent, and trusted by thousands across the country.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link href="/find-vehicle" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full h-16 px-10 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-600/30 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 group">
                                    Book a Vehicle
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/auth/register" className="w-full sm:w-auto">
                                <Button size="lg" variant="outline" className="w-full h-16 px-10 text-lg bg-white/50 backdrop-blur-sm text-slate-700 border-slate-200 hover:bg-white hover:border-blue-400 transition-all rounded-2xl font-bold">
                                    Join as Driver
                                </Button>
                            </Link>
                        </div>

                        {/* Feature Badges */}
                        <div className="flex flex-wrap gap-6 pt-4">
                            <div className="flex items-center gap-3 text-slate-600 font-semibold">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="text-sm">100% Verified</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 font-semibold">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Globe className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-sm">Pan-India Reach</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 font-semibold">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <Gauge className="w-5 h-5 text-amber-600" />
                                </div>
                                <span className="text-sm">Real-time Telematics</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Visual Component */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative hidden lg:block h-full"
                    >
                        <div className="relative z-20 overflow-hidden rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(37,99,235,0.2)] bg-slate-900 border-8 border-slate-100/50">
                            <StrategicHeroVisual />
                        </div>

                        {/* Floating Stats */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-10 right-10 z-30 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-white/50"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                98%
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Compliance Rate</p>
                                <p className="text-sm font-bold text-slate-800">Perfect Fleet Status</p>
                            </div>
                        </motion.div>

                        {/* Decorative Rings */}
                        <div className="absolute -top-10 -right-10 w-64 h-64 border-2 border-blue-200/50 rounded-full -z-10 animate-spin-slow" />
                        <div className="absolute -bottom-10 -left-10 w-96 h-96 border-2 border-slate-200/50 rounded-full -z-10 animate-reverse-spin-slow" />
                    </motion.div>
                </div>
            </div>

            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </section>
    );
}
