import { useEffect, useState, useCallback } from 'react';
import { useAppStore, type ModuleId } from '@/lib/store';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  LayoutDashboard, FolderKanban, Wallet, Heart,
  FileText, Music, Calendar, Users, Bot,
  Plus, Search, Zap, Settings, Moon, Sun, BarChart3,
  Disc3, Lightbulb, Youtube
} from 'lucide-react';
import { useTheme } from 'next-themes';

type CommandAction = {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  shortcut?: string;
  keywords?: string;
};

const moduleCommands: { id: ModuleId; label: string; icon: React.ElementType; keywords: string }[] = [
  { id: 'dashboard', label: 'Ana Sayfa', icon: LayoutDashboard, keywords: 'home anasayfa dashboard' },
  { id: 'projects', label: 'Projeler', icon: FolderKanban, keywords: 'projeler görevler tasks projects' },
  { id: 'finance', label: 'Finans', icon: Wallet, keywords: 'finans bütçe gelir gider para money finance' },
  { id: 'wellness', label: 'Wellness', icon: Heart, keywords: 'wellness sağlık timer pomodoro zen focus' },
  { id: 'notes', label: 'Notlar', icon: FileText, keywords: 'notlar notes yazı metin' },
  { id: 'catalog', label: 'Katalog', icon: Music, keywords: 'katalog müzik sanatçı music catalog' },
  { id: 'calendar', label: 'Takvim', icon: Calendar, keywords: 'takvim etkinlik calendar event' },
  { id: 'crm', label: 'Kişiler', icon: Users, keywords: 'kişiler ilişkiler crm ekip contacts' },
  { id: 'maestro', label: 'Maestro AI', icon: Disc3, keywords: 'maestro ai müzik yapay zeka üretim suno udio production' },
  { id: 'ideas', label: 'Fikirler', icon: Lightbulb, keywords: 'fikirler ideas beyin fırtına brainstorm ilham inspiration' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, keywords: 'youtube video kanal channel içerik content creator' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, keywords: 'analytics istatistik rapor analiz grafik chart' },
  { id: 'assistant', label: 'AI Asistan', icon: Bot, keywords: 'asistan ai yapay zeka assistant chat' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { setActiveModule } = useAppStore();
  const { theme, setTheme } = useTheme();

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = useCallback((moduleId: ModuleId) => {
    setActiveModule(moduleId);
    setOpen(false);
  }, [setActiveModule]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setOpen(false);
  }, [theme, setTheme]);

  const quickActions: CommandAction[] = [
    {
      id: 'new-task',
      label: 'Yeni Görev Ekle',
      icon: Plus,
      action: () => navigateTo('projects'),
      keywords: 'yeni görev ekle new task add',
    },
    {
      id: 'new-note',
      label: 'Yeni Not Oluştur',
      icon: FileText,
      action: () => navigateTo('notes'),
      keywords: 'yeni not oluştur new note create',
    },
    {
      id: 'start-focus',
      label: 'Focus Modu Başlat',
      icon: Zap,
      action: () => navigateTo('wellness'),
      keywords: 'focus odak pomodoro timer başlat',
    },
    {
      id: 'toggle-theme',
      label: theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç',
      icon: theme === 'dark' ? Sun : Moon,
      action: toggleTheme,
      keywords: 'tema theme dark light karanlık aydınlık',
    },
  ];

  return (
    <>
      {/* Trigger hint — search bar in sidebar footer area */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Komut veya ara... ⌘K" />
        <CommandList>
          <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading="Hızlı Eylemler">
            {quickActions.map(cmd => (
              <CommandItem
                key={cmd.id}
                onSelect={cmd.action}
                keywords={[cmd.keywords || '']}
              >
                <cmd.icon className="w-4 h-4 mr-2" />
                <span>{cmd.label}</span>
                {cmd.shortcut && <CommandShortcut>{cmd.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Navigation */}
          <CommandGroup heading="Sayfalar">
            {moduleCommands.map(mod => (
              <CommandItem
                key={mod.id}
                onSelect={() => navigateTo(mod.id)}
                keywords={[mod.keywords]}
              >
                <mod.icon className="w-4 h-4 mr-2" />
                <span>{mod.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
