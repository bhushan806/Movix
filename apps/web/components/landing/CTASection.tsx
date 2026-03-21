'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Truck, ArrowBigRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="w-full py-32 bg-blue-600 relative overflow-hidden">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-blue-700/10 -z-10" />

      <div className="container px-4 md:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto space-y-12"
        >
          <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-3xl mb-4 border border-white/20">
            <Truck className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
            Logistics Management <br />
            Made Simple.
          </h2>

          <p className="max-w-2xl mx-auto text-blue-100 text-lg md:text-xl font-medium leading-relaxed mb-10">
            Join thousands of fleet owners and drivers across India. Scale your business and manage your operations with total confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth/register">
              <Button size="lg" className="h-14 px-10 text-lg bg-white text-blue-600 hover:bg-slate-50 shadow-xl rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 group">
                Get Started
                <ArrowBigRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/find-vehicle">
              <Button size="lg" className="h-14 px-10 text-lg bg-blue-500/20 hover:bg-blue-500/40 text-white border border-white/20 backdrop-blur-md rounded-2xl font-bold transition-all transition-colors">
                Marketplace
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Trust Ticker at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 py-6 bg-blue-900/30 backdrop-blur-sm border-t border-white/10 group">
        <div className="flex gap-12 animate-scroll-left whitespace-nowrap overflow-hidden py-1">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="text-blue-200/50 font-black text-sm uppercase tracking-widest px-4 border-r border-white/10 last:border-0 hover:text-white transition-colors cursor-default">
              TRUCKNET INDIA • PAN-INDIA COVERAGE • 100% VERIFIED • 24/7 SUPPORT
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
