'use client';

import { motion } from 'framer-motion';
import { Search, CheckCircle2, Truck, CreditCard } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: "Search & Match",
    description: "Enter your load details and destination. Our AI instantly finds the best-fit vehicles currently available in your region.",
    color: "bg-blue-600",
  },
  {
    icon: CheckCircle2,
    title: "Verify & Confirm",
    description: "Review driver profiles, vehicle documents, and transparent quotes. Secure your booking with a single click.",
    color: "bg-indigo-600",
  },
  {
    icon: Truck,
    title: "Track in Real-time",
    description: "Monitor your shipment's journey with precision GPS. Receive automated alerts at every major milestone and checkpoint.",
    color: "bg-violet-600",
  },
  {
    icon: CreditCard,
    title: "Seamless Payment",
    description: "Complete your transaction securely through our integrated gateway. Access professional invoices and trip summaries instantly.",
    color: "bg-emerald-600",
  }
];

export function HowItWorks() {
  return (
    <section className="w-full py-32 bg-white relative overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Simple Logistics <span className="text-blue-600">Management.</span>
          </h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Everything you need to move freight efficiently in four straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {STEPS.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Connector line for desktop */}
              {idx < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px border-t-2 border-dashed border-slate-200 -z-10" />
              )}

              <div className={`w-24 h-24 rounded-[2rem] ${step.color} text-white flex items-center justify-center mb-8 shadow-2xl shadow-blue-900/10 group-hover:scale-110 transition-transform duration-500 relative`}>
                <step.icon className="w-10 h-10" />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-sm shadow-md border border-slate-100">
                  {idx + 1}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
