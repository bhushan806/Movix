'use client';

import { motion } from 'framer-motion';
import { Truck, Map, CircleDollarSign, ShieldCheck, Zap, BarChart3, Clock, Globe } from 'lucide-react';
import { ReactNode } from 'react';

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -10 }}
            className="group relative p-8 rounded-[2rem] bg-white border border-slate-200 hover:border-blue-400/50 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] transition-all duration-500"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none" />

            <div className="relative z-10">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm border border-slate-100">
                    {icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">{title}</h3>
                <p className="text-slate-500 leading-relaxed text-lg font-medium">
                    {description}
                </p>
            </div>
            
            {/* Hover Indicator */}
            <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-600" />
                </div>
            </div>
        </motion.div>
    );
}

export function FeatureGrid() {
    const features = [
        {
            icon: <Truck className="w-8 h-8" />,
            title: "Smart Matching",
            description: "AI-driven algorithms connect your loads with the most efficient vehicle types based on route, capacity, and urgency."
        },
        {
            icon: <Map className="w-8 h-8" />,
            title: "Dynamic Routing",
            description: "Proprietary engine calculates real-time routes avoiding congestion, weather hazards, and restricted zones."
        },
        {
            icon: <ShieldCheck className="w-8 h-8" />,
            title: "Verified Ecosystem",
            description: "Every driver and fleet owner undergoes a multi-layer verification process for absolute shipment security."
        },
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: "Fleet Analytics",
            description: "Deep insights into fuel consumption, idle times, and driver performance to maximize your operational ROI."
        },
        {
            icon: <Clock className="w-8 h-8" />,
            title: "Real-time Tracking",
            description: "Know exactly where your cargo is with millisecond-accurate GPS and automated milestone updates."
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Pan-India Reach",
            description: "From metropolitan hubs to remote rural districts, we cover every corner of the Indian subcontinent."
        }
    ];

    return (
        <section className="w-full py-32 bg-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            
            <div className="container px-4 md:px-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-bold uppercase tracking-wider">
                            The Platform
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
                            Built for Modern <br />
                            <span className="text-blue-600">Logistics.</span>
                        </h2>
                    </div>
                    <p className="max-w-md text-slate-500 text-xl font-medium leading-relaxed">
                        Industry-leading technology designed to handle the complexities of the Indian transportation market.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <FeatureCard
                            key={idx}
                            {...feature}
                            delay={idx * 0.1}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
