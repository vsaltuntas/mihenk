import { useAppStore, ENERGY_MODES } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Activity, Bot, Wifi, Database, Clock, Server } from 'lucide-react';

export default function FooterBar() {
  const { energyMode, setEnergyMode, sidebarOpen } = useAppStore();

  return (
    <footer className={cn(
      "fixed bottom-0 right-0 h-10 border-t border-border bg-background/80 backdrop-blur-sm z-20 flex items-center px-4 gap-3 text-xs text-muted-foreground transition-all duration-300 overflow-x-auto",
      sidebarOpen ? "left-0 md:left-[260px]" : "left-0 md:left-[52px]"
    )}>
      {/* System status */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--mihenk-green))] animate-pulse" />
        <Server className="w-3 h-3" />
        <span className="hidden sm:inline">Sistem aktif</span>
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      {/* Sync status */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Wifi className="w-3 h-3" />
        <span>Senkron</span>
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      {/* Agent status */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Bot className="w-3 h-3" />
        <span className="hidden sm:inline">Ajan hazır</span>
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      {/* Data source */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Database className="w-3 h-3" />
        <span className="hidden md:inline">Kaynak:</span>
        <span className="font-medium text-[hsl(var(--mihenk-blue))]">Taskade</span>
      </div>

      <div className="w-px h-4 bg-border shrink-0 hidden md:block" />

      {/* Last backup */}
      <div className="flex items-center gap-1.5 shrink-0 hidden md:flex">
        <Clock className="w-3 h-3" />
        <span>Yedek: —</span>
      </div>

      <div className="flex-1" />

      {/* Energy mode quick switch */}
      <div className="flex items-center gap-1 shrink-0">
        {ENERGY_MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => setEnergyMode(mode.id)}
            title={mode.label}
            className={cn(
              "w-6 h-6 rounded flex items-center justify-center text-xs transition-all",
              energyMode === mode.id
                ? "bg-primary/10 ring-1 ring-primary/30"
                : "hover:bg-muted opacity-60 hover:opacity-100"
            )}
          >
            {mode.icon}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      <span className="opacity-50 font-mono text-[10px] shrink-0">MİHENK v1.0</span>
    </footer>
  );
}
