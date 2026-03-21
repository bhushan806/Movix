'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, LayoutDashboard, User, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Market', icon: Search, href: '/dashboard/owner/loads' },
  { label: 'Add', icon: PlusCircle, href: '/dashboard/owner/vehicles', primary: true },
  { label: 'Fleet', icon: LayoutDashboard, href: '/dashboard/owner' },
  { label: 'Profile', icon: User, href: '/profile' }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
      <div className="bg-white/80 backdrop-blur-2xl border border-slate-200/50 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.05)] rounded-[2rem] p-2 flex items-center justify-between pointer-events-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.primary) {
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                aria-label={item.label}
                className="relative -mt-10 mb-2 group"
              >
                <motion.div 
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30 text-white"
                >
                  <Icon className="w-7 h-7" />
                </motion.div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link 
              key={item.href} 
              href={item.href} 
              aria-label={item.label}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300 relative",
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon className={cn("w-6 h-6 mb-1", isActive ? "fill-blue-50" : "")} />
              <span className="text-[10px] font-bold uppercase tracking-tight">
                {item.label}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-indicator"
                  className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
