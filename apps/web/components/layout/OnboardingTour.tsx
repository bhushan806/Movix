'use client';

import { useUX } from '@/lib/ux-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    title: "Welcome to TruckNet India",
    description: "Your AI-powered logistics command center. Let's take a quick 3-step tour of the key features.",
    target: "body",
    position: "center"
  },
  {
    title: "Fleet Command",
    description: "Manage your entire fleet here. Add new vehicles, track maintenance, and ensure compliance for every truck.",
    target: "#fleet-command-btn",
    position: "bottom"
  },
  {
    title: "Live Load Marketplace",
    description: "Find and bid on high-value loads across India. Use smart filters to match your trucks with the best routes.",
    target: "#load-marketplace-link",
    position: "bottom"
  },
  {
    title: "Your AI Logistics Assistant",
    description: "Meet 'Dost'. Ask him anything about your fleet, market trends, or route optimizations.",
    target: "#ai-assistant-orb",
    position: "left"
  }
];

export function OnboardingTour() {
  const { isTourOpen, setIsTourOpen, currentTourStep, setCurrentTourStep, setOnboardingComplete } = useUX();

  if (!isTourOpen) return null;

  const step = STEPS[currentTourStep];
  const isFirst = currentTourStep === 0;
  const isLast = currentTourStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setOnboardingComplete(true);
    } else {
      setCurrentTourStep(currentTourStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) setCurrentTourStep(currentTourStep - 1);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] pointer-events-none">
        {/* Backdrop overlay with mask (mocking spotlight) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] pointer-events-auto"
          onClick={() => setIsTourOpen(false)}
        />

        <div className="relative h-full w-full flex items-center justify-center p-6">
          <motion.div
            key={currentTourStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto"
          >
            <div className="bg-blue-600 p-8 text-white relative">
              <button
                onClick={() => setIsTourOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center font-black text-xl">
                  {currentTourStep + 1}
                </div>
                <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentTourStep + 1) / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>

              <h3 className="text-2xl font-black tracking-tight mb-2">{step.title}</h3>
              <p className="text-blue-100 font-medium leading-relaxed">{step.description}</p>
            </div>

            <div className="p-8 bg-white flex items-center justify-between gap-4">
              {!isFirst && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="h-12 px-6 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}

              <div className={cn("flex gap-3", isFirst ? "w-full" : "flex-1")}>
                <Button
                  onClick={handleNext}
                  className={cn(
                    "h-14 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg",
                    isLast ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 w-full" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 w-full"
                  )}
                >
                  {isLast ? (
                    <>GET STARTED <CheckCircle2 className="ml-2 h-5 w-5" /></>
                  ) : (
                    <>NEXT STEP <ChevronRight className="ml-2 h-5 w-5" /></>
                  )}
                </Button>
              </div>
            </div>

            <div className="px-8 pb-6 bg-white">
              <button
                onClick={() => setOnboardingComplete(true)}
                className="text-xs font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors mx-auto block"
              >
                Skip Tour
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
