import { X, ExternalLink, AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  insights?: {
    riskScore: number;
    delay: string;
    alternateRoute?: string;
    explanation?: string;
  };
}

export function AIPanel({ isOpen, onClose, children, insights }: AIPanelProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9998] bg-slate-900/20 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sliding Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] md:w-[450px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col border-l border-border ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground leading-tight text-base">TruckNet AI</h3>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">Intelligent Logistics Assistant</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* AI Insights Section */}
        {insights && (
          <div className="px-4 py-3 border-b border-border bg-slate-50/60 shadow-sm z-10">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Live Trip Insights</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white p-3 rounded-xl border border-border shadow-sm">
                <p className="text-[11px] text-slate-500 mb-1">Risk Score</p>
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full shadow-sm ${insights.riskScore > 70 ? 'bg-red-500 shadow-red-500/40' : insights.riskScore > 40 ? 'bg-amber-500 shadow-amber-500/40' : 'bg-emerald-500 shadow-emerald-500/40'}`} />
                  <span className="font-bold text-lg text-slate-800">{insights.riskScore}%</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-border shadow-sm">
                <p className="text-[11px] text-slate-500 mb-1">Est. Delay</p>
                <span className="font-bold text-lg text-slate-800">{insights.delay}</span>
              </div>
            </div>
            
            {insights.explanation && (
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex gap-2.5 items-start mt-2">
                <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-800 leading-snug">{insights.explanation}</p>
              </div>
            )}
            
            {insights.alternateRoute && (
              <button className="mt-3 w-full text-left bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 p-3 rounded-xl flex items-center justify-between transition-colors group shadow-sm">
                <div>
                  <p className="text-xs font-medium text-emerald-800 mb-1">Suggested Alternate Route</p>
                  <p className="text-sm font-semibold text-emerald-950">{insights.alternateRoute}</p>
                </div>
                <div className="bg-white p-1.5 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <ExternalLink className="h-4 w-4 text-emerald-600" />
                </div>
              </button>
            )}
          </div>
        )}

        {/* Chat Interface Container */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {children}
        </div>
      </div>
    </>
  );
}
