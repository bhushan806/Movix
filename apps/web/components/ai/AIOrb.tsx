import { Bot } from 'lucide-react';

interface AIOrbProps {
  onClick: () => void;
  isOpen: boolean;
  status?: 'normal' | 'warning' | 'risk';
}

export function AIOrb({ onClick, isOpen, status = 'normal' }: AIOrbProps) {
  const statusColors = {
    normal: 'bg-emerald-500 shadow-emerald-500/50',
    warning: 'bg-amber-500 shadow-amber-500/50',
    risk: 'bg-red-500 shadow-red-500/50'
  };

  return (
    <button
      id="ai-assistant-orb"
      onClick={onClick}
      aria-label="Toggle AI Assistant"
      suppressHydrationWarning={true}
      className={`fixed bottom-24 md:bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-[9997] flex items-center justify-center transition-all duration-300 hover:scale-[1.05] ${statusColors[status]} ${isOpen ? 'scale-90 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
    >
      <Bot className="h-6 w-6 text-white relative z-10" />
      <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-current"></span>
    </button>
  );
}
