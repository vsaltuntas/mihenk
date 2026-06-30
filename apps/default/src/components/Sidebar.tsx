import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, MENU_GROUPS, ENERGY_MODES, type ModuleId } from '@/lib/store';
import {
  Sun, Zap, Briefcase, Brain, Music, Mic, Users, Heart, Bot, ShieldCheck, Pickaxe,
  LayoutDashboard, Sunrise, Bell, BatteryCharging, Activity,
  Lightbulb, Radio, Bookmark, StickyNote, CirclePlus,
  FolderKanban, CheckSquare, Calendar, Repeat, Copy,
  FileText, GitBranch, HardDrive, Search, Columns, BookOpen,
  Disc, Wand2, Headphones, Youtube, TrendingUp, Radar,
  PenTool, Type, Library, MonitorSpeaker, AudioWaveform, SlidersHorizontal, Clapperboard,
  Contact, Mail, FileSignature, Target, MapPin,
  Wallet, Flame, Smile, BarChart3,
  MessageCircle, Shield, Network, GitPullRequest, Cog, Hammer,
  Lock, HeartPulse, Database, Rocket, Settings, EyeOff, Factory,
  Mountain, ScanSearch, Scale, ShieldQuestion, LockKeyhole,
  ChevronRight, PanelLeftClose, PanelLeft, Menu,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  'sun': Sun, 'zap': Zap, 'briefcase': Briefcase, 'brain': Brain,
  'music': Music, 'mic': Mic, 'users': Users, 'heart': Heart,
  'bot': Bot, 'shield-check': ShieldCheck, 'pickaxe': Pickaxe,
  'layout-dashboard': LayoutDashboard, 'sunrise': Sunrise, 'bell': Bell,
  'battery-charging': BatteryCharging, 'activity': Activity,
  'lightbulb': Lightbulb, 'radio': Radio, 'bookmark': Bookmark,
  'sticky-note': StickyNote, 'circle-plus': CirclePlus,
  'folder-kanban': FolderKanban, 'check-square': CheckSquare, 'calendar': Calendar,
  'repeat': Repeat, 'copy': Copy,
  'file-text': FileText, 'git-branch': GitBranch, 'hard-drive': HardDrive,
  'search': Search, 'columns': Columns, 'book-open': BookOpen,
  'disc': Disc, 'wand-2': Wand2, 'headphones': Headphones,
  'youtube': Youtube, 'trending-up': TrendingUp, 'radar': Radar,
  'pen-tool': PenTool, 'type': Type, 'library': Library,
  'monitor-speaker': MonitorSpeaker, 'audio-waveform': AudioWaveform,
  'sliders-horizontal': SlidersHorizontal, 'clapperboard': Clapperboard,
  'contact': Contact, 'mail': Mail, 'file-signature': FileSignature,
  'target': Target, 'map-pin': MapPin,
  'wallet': Wallet, 'flame': Flame, 'smile': Smile, 'bar-chart-3': BarChart3,
  'message-circle': MessageCircle, 'shield': Shield, 'network': Network,
  'git-pull-request': GitPullRequest, 'cog': Cog, 'hammer': Hammer,
  'lock': Lock, 'heart-pulse': HeartPulse, 'database': Database,
  'rocket': Rocket, 'settings': Settings, 'eye-off': EyeOff,
  'mountain': Mountain, 'scan-search': ScanSearch, 'scale': Scale,
  'shield-question': ShieldQuestion, 'lock-keyhole': LockKeyhole,
  'factory': Factory,
};

function IconComponent({ name, className }: { name: string; className?: string }) {
  const Comp = ICON_MAP[name];
  if (!Comp) return <div className={cn("w-4 h-4", className)} />;
  return <Comp className={cn("w-4 h-4", className)} />;
}

export default function Sidebar() {
  const { activeModule, setActiveModule, sidebarOpen, toggleSidebar, energyMode } = useAppStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['bugun', 'yakalama', 'is_omurgasi', 'bilgi_hafiza', 'muzik_yayin', 'studyo', 'insan_is', 'yasam', 'ajanlar_otomasyon', 'sistem_guven', 'maden'])
  );

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const currentEnergy = ENERGY_MODES.find(m => m.id === energyMode);

  // Find active group for highlighting
  const activeGroupId = MENU_GROUPS.find(g =>
    g.modules.some(m => m.id === activeModule)
  )?.id;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed top-3 left-3 z-50 md:hidden p-2 rounded-lg bg-card border border-border shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={cn(
        "fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300 border-r border-sidebar-border",
        "bg-[var(--sidebar)]",
        sidebarOpen ? "w-[260px]" : "w-[52px]",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border shrink-0">
          {sidebarOpen ? (
            <>
              <div className="w-7 h-7 rounded-lg bg-[hsl(var(--mihenk-red))] flex items-center justify-center">
                <span className="text-white text-xs font-bold font-serif">M</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-bold font-serif tracking-tight text-sidebar-foreground">MİHENK</h1>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">{currentEnergy?.icon}</span>
                  <span className="text-[10px] text-muted-foreground">{currentEnergy?.label}</span>
                </div>
              </div>
              <button onClick={toggleSidebar} className="p-1 rounded hover:bg-sidebar-accent text-muted-foreground">
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button onClick={toggleSidebar} className="p-1 rounded hover:bg-sidebar-accent text-muted-foreground mx-auto">
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Menu Groups */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {MENU_GROUPS.map(group => {
            const isExpanded = expandedGroups.has(group.id);
            const isActiveGroup = group.id === activeGroupId;

            if (!sidebarOpen) {
              // Collapsed: show only group icons
              const firstModule = group.modules[0];
              return (
                <button
                  key={group.id}
                  onClick={() => setActiveModule(firstModule.id)}
                  title={group.label}
                  className={cn(
                    "w-full flex items-center justify-center p-2 rounded-lg transition-colors",
                    isActiveGroup
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <IconComponent name={group.icon} className="w-4 h-4" />
                </button>
              );
            }

            return (
              <div key={group.id}>
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-colors",
                    isActiveGroup ? "text-sidebar-foreground bg-sidebar-accent/60" : "text-muted-foreground hover:text-sidebar-foreground"
                  )}
                >
                  <ChevronRight className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-90")} />
                  <IconComponent name={group.icon} className="w-3.5 h-3.5" />
                  <span>{group.label}</span>
                </button>

                {/* Module items */}
                {isExpanded && (
                  <div className={cn(
                    "ml-3 pl-2 border-l-2 space-y-0.5 mt-0.5 mb-1.5 transition-colors",
                    isActiveGroup ? "border-l-sidebar-primary" : "border-l-border/40"
                  )}>
                    {group.modules.map(mod => {
                      const isActive = activeModule === mod.id;
                      return (
                        <button
                          key={mod.id}
                          onClick={() => setActiveModule(mod.id)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-all duration-150 relative",
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
                              : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          )}
                        >
                          {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[11px] w-[3px] h-4 rounded-r-full bg-sidebar-primary" />}
                          <IconComponent name={mod.icon} className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{mod.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer — system status */}
        {sidebarOpen && (
          <div className="shrink-0 px-3 py-2.5 border-t border-sidebar-border">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--mihenk-green))]" />
              <span>Sistem aktif</span>
              <span className="ml-auto opacity-60">v1.0</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
