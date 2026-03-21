'use client';

import { motion } from 'framer-motion';
import { Users, MapPin, PackageCheck, Activity } from 'lucide-react';

const stats = [
    { label: "Active Drivers", value: "12,000+", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Cities Covered", value: "85+", icon: MapPin, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Loads Delivered", value: "1.2M+", icon: PackageCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Platform Uptime", value: "99.9%", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
];

export function StatsRibbon() {
    return (
        <section className="container px-4 md:px-6 max-w-7xl mx-auto relative z-20">
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 p-10 md:p-12 overflow-hidden relative">
                {/* Background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-blue-50/20 via-transparent to-indigo-50/20 pointer-events-none" />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 relative z-10">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center justify-center group"
                        >
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm border border-white`}>
                                <stat.icon className="w-8 h-8 md:w-10 md:h-10" />
                            </div>
                            <span className="text-3xl md:text-5xl font-black text-slate-900 mb-2 tracking-tighter">
                                {stat.value}
                            </span>
                            <span className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-[0.2em] text-center">
                                {stat.label}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
