import { useState, useMemo } from 'react';
import { Disc3, ChevronDown, ChevronRight, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import TrackCard, { TRACK_PIPE } from './TrackCard';

interface AlbumGroupProps {
  tracks: any[];
  onRefetch: () => void;
}

interface AlbumData {
  name: string;
  tracks: any[];
  pipelineStats: Record<string, number>;
}

export default function AlbumGroup({ tracks, onRefetch }: AlbumGroupProps) {
  const [expandedAlbums, setExpandedAlbums] = useState<Set<string>>(new Set());

  const albums = useMemo(() => {
    const albumMap = new Map<string, any[]>();
    const ungrouped: any[] = [];

    for (const t of tracks) {
      const albumName = (t.fieldValues['/attributes/@talbm'] as string)?.trim();
      if (albumName) {
        const existing = albumMap.get(albumName) || [];
        existing.push(t);
        albumMap.set(albumName, existing);
      } else {
        ungrouped.push(t);
      }
    }

    const result: AlbumData[] = [];
    for (const [name, albumTracks] of albumMap.entries()) {
      const pipelineStats: Record<string, number> = {};
      for (const t of albumTracks) {
        const pipe = (t.fieldValues['/attributes/@tpipe'] as string) || 'tp-taslak';
        pipelineStats[pipe] = (pipelineStats[pipe] || 0) + 1;
      }
      result.push({ name, tracks: albumTracks, pipelineStats });
    }

    // Sort: more tracks first
    result.sort((a, b) => b.tracks.length - a.tracks.length);

    if (ungrouped.length > 0) {
      const pipelineStats: Record<string, number> = {};
      for (const t of ungrouped) {
        const pipe = (t.fieldValues['/attributes/@tpipe'] as string) || 'tp-taslak';
        pipelineStats[pipe] = (pipelineStats[pipe] || 0) + 1;
      }
      result.push({ name: '(Albümsüz Trackler)', tracks: ungrouped, pipelineStats });
    }

    return result;
  }, [tracks]);

  const toggleAlbum = (name: string) => {
    setExpandedAlbums(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  if (albums.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground text-sm">
        <Disc3 className="w-8 h-8 mx-auto mb-2 opacity-20" />
        <p>Henüz track yok</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {albums.map(album => {
        const isExpanded = expandedAlbums.has(album.name);
        const publishedCount = album.pipelineStats['tp-yayinda'] || 0;
        const isAlbumsuz = album.name === '(Albümsüz Trackler)';
        const allPublished = publishedCount === album.tracks.length;

        return (
          <div key={album.name} className="mihenk-card border border-border rounded-xl overflow-hidden">
            {/* Album Header */}
            <button
              onClick={() => toggleAlbum(album.name)}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
            >
              <div className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                isAlbumsuz
                  ? 'bg-muted'
                  : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20'
              )}>
                {isAlbumsuz ? <Music className="w-5 h-5 text-muted-foreground" /> : <Disc3 className="w-5 h-5 text-purple-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('font-semibold text-sm', isAlbumsuz && 'text-muted-foreground italic')}>
                  {album.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">{album.tracks.length} track</span>
                  {/* Pipeline mini-badges */}
                  {Object.entries(album.pipelineStats).map(([pipe, count]) => {
                    const p = TRACK_PIPE[pipe];
                    if (!p) return null;
                    return (
                      <span key={pipe} className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-full', p.cls)}>
                        {count} {p.label}
                      </span>
                    );
                  })}
                  {allPublished && !isAlbumsuz && (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">✓ Tam Yayında</span>
                  )}
                </div>
              </div>
              {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </button>

            {/* Tracks */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-border"
                >
                  <div className="divide-y divide-border/50">
                    {album.tracks.map(t => (
                      <TrackCard key={t.id} track={t} onRefetch={onRefetch} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
