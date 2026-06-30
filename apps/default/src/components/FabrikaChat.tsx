/**
 * FABRİKA Üretim Sohbeti — Embedded agent chat panel
 * v0.5: v2 Agent Chat SDK + AI Elements UI
 * Agent: FABRİKA — Yaratıcı Üretim Ustası (01KVAMD3H5B2J3SQQ1DP0G188H)
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { createConversation, createAgentChat } from '@/lib/agent-chat/v2';
import { isToolUIPart } from 'ai';
import type { UIMessage } from 'ai';
import { ulid } from 'ulidx';
import { cn } from '@/lib/utils';
import {
  Factory, Send, Sparkles, Loader2, MessageCircle,
  Mic, Palette, Disc, Youtube, PenTool,
  X, Maximize2, Minimize2,
} from 'lucide-react';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import {
  Confirmation, ConfirmationTitle, ConfirmationRequest, ConfirmationAccepted, ConfirmationRejected, ConfirmationActions, ConfirmationAction,
} from '@/components/ai-elements/confirmation';

const FABRIKA_AGENT_ID = '01KVAMD3H5B2J3SQQ1DP0G188H';

const STARTERS = [
  { emoji: '🎤', title: 'Sanatçı Üret', prompt: 'Zaruret Records için yeni bir kurgusal sanatçı persona üret. Genre: Anatolian Electronic. Detaylı sonic DNA, backstory ve ilk single konsepti dahil.', icon: Mic },
  { emoji: '🎨', title: 'Brand Kit', prompt: 'Zaruret Records ana markası için kapsamlı brand kit oluştur. 10 alanın tamamını doldur: visual concept, renk paleti, logo, typography, tone of voice, key vocabulary, avoid words, AI disclosure, cover art families.', icon: Palette },
  { emoji: '✨', title: 'Suno Prompt', prompt: 'Dark Ambient Anatolian tarzında, 85 BPM, Am key, melancholic mood ile bir Suno v4 prompt üret. Structure tags ve instrumentation dahil.', icon: Sparkles },
  { emoji: '📺', title: 'Kanal Stratejisi', prompt: 'Zaruret Records YouTube kanalı için niche analizi ve kanal stratejisi hazırla. İçerik sütunları, ilk 10 video fikri, SEO keyword clusters dahil.', icon: Youtube },
  { emoji: '💿', title: 'Albüm Konsepti', prompt: 'Anatolian Noir temalı 6 tracklık bir EP konsepti kur. Tracklist, sonic ark, genre blend, referans sanatçılar ve kapak yönü dahil.', icon: Disc },
  { emoji: '✍️', title: 'Şarkı Sözü Yaz', prompt: 'Türkçe melancholic bir şarkı sözü yaz. Verse 1, Chorus, Verse 2, Chorus, Bridge, Final Chorus. Tema: gece yürüyüşü, İstanbul, yalnızlık.', icon: PenTool },
];

interface FabrikaChatProps {
  initialBrief?: string;
  onOutput?: (text: string) => void;
  compact?: boolean;
}

/* ─── Message Parts Renderer ─── */
function MessageParts({ message, onApprove }: {
  message: UIMessage;
  onApprove: ReturnType<typeof useChat>['addToolApprovalResponse'];
}) {
  return (
    <>
      {message.parts.map((part, i) => {
        const key = `${message.id}-${i}`;
        if (part.type === 'text') {
          return message.role === 'user'
            ? <p key={key} className="text-sm">{part.text}</p>
            : <MessageResponse key={key}>{part.text}</MessageResponse>;
        }
        if (isToolUIPart(part)) {
          return (
            <Tool key={key}>
              <ToolHeader type={part.type} state={part.state} />
              <ToolContent>
                <ToolInput input={part.input} />
                <Confirmation approval={part.approval} state={part.state}>
                  <ConfirmationRequest><ConfirmationTitle>Bu aracı çalıştırmak istiyor musunuz?</ConfirmationTitle></ConfirmationRequest>
                  <ConfirmationAccepted>Onaylandı</ConfirmationAccepted>
                  <ConfirmationRejected>Reddedildi</ConfirmationRejected>
                  <ConfirmationActions>
                    <ConfirmationAction variant="outline" onClick={() => part.approval != null && onApprove({ id: part.approval.id, approved: false })}>Reddet</ConfirmationAction>
                    <ConfirmationAction onClick={() => part.approval != null && onApprove({ id: part.approval.id, approved: true })}>Onayla</ConfirmationAction>
                  </ConfirmationActions>
                </Confirmation>
                <ToolOutput output={part.output} errorText={part.errorText} />
              </ToolContent>
            </Tool>
          );
        }
        return null;
      })}
    </>
  );
}

/* ─── Active Chat ─── */
function ActiveFabrikaChat({
  chat, expanded, setExpanded, onReset,
  initialBrief, onOutput,
}: {
  chat: ReturnType<typeof createAgentChat>;
  expanded: boolean; setExpanded: (v: boolean) => void; onReset: () => void;
  initialBrief?: string; onOutput?: (text: string) => void;
}) {
  const { messages, status, addToolApprovalResponse } = useChat({ chat, id: chat.id });
  const [inputText, setInputText] = useState('');
  const isSending = status === 'submitted' || status === 'streaming';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Auto-send initialBrief
  const sentRef = useRef(false);
  useEffect(() => {
    if (initialBrief && !sentRef.current && status === 'ready') {
      sentRef.current = true;
      chat.sendMessage({ id: ulid(), role: 'user', parts: [{ type: 'text', text: initialBrief }] });
    }
  }, [initialBrief, status, chat]);

  // Extract last assistant message text for onOutput
  useEffect(() => {
    if (onOutput && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') {
        const textParts = lastMsg.parts.filter(p => p.type === 'text').map(p => (p as { text: string }).text);
        if (textParts.length > 0) onOutput(textParts.join(''));
      }
    }
  }, [messages, onOutput]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    await chat.sendMessage({ id: ulid(), role: 'user', parts: [{ type: 'text', text }] });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className={cn('flex flex-col', expanded ? 'h-[500px]' : 'h-[300px]')}>
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-border/30 mb-3 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center">
          <Factory className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-semibold">FABRİKA Üretim Sohbeti</h4>
          <p className="text-[9px] text-muted-foreground">{isSending ? '● Yanıtlıyor...' : '● Bağlı'}</p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          {expanded ? <Minimize2 className="w-3.5 h-3.5 text-muted-foreground" /> : <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        <button onClick={onReset} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Yeni sohbet">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 px-1 scrollbar-none">
        {messages.map(msg => (
          <Message key={msg.id} from={msg.role}>
            <MessageContent>
              <MessageParts message={msg} onApprove={addToolApprovalResponse} />
            </MessageContent>
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-border/30 mt-3 flex-shrink-0">
        <input
          className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          placeholder="Brief yaz veya devam et..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isSending}
          className="px-3 py-2.5 rounded-xl bg-amber-500 text-white disabled:opacity-40 transition-opacity hover:bg-amber-600"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

/* ─── Wrapper: Landing + Chat ─── */
export default function FabrikaChat({ initialBrief, onOutput, compact }: FabrikaChatProps) {
  const [chat, setChat] = useState<ReturnType<typeof createAgentChat> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expanded, setExpanded] = useState(!compact);
  const [inputText, setInputText] = useState(initialBrief || '');

  const handleStartChat = useCallback(async () => {
    setIsCreating(true);
    try {
      const { conversationId } = await createConversation(FABRIKA_AGENT_ID);
      setChat(createAgentChat(FABRIKA_AGENT_ID, conversationId));
    } catch (e) {
      console.error('Failed to create FABRİKA conversation:', e);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const handleStartAndSend = useCallback(async (text: string) => {
    setIsCreating(true);
    try {
      const { conversationId } = await createConversation(FABRIKA_AGENT_ID);
      setChat(createAgentChat(FABRIKA_AGENT_ID, conversationId));
      // initialBrief will be sent by ActiveFabrikaChat via useEffect
    } catch (e) {
      console.error('Failed:', e);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    await handleStartAndSend(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleReset = () => { setChat(null); setInputText(''); };

  // Loading
  if (isCreating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-3" />
        <p className="text-xs text-muted-foreground">FABRİKA asistanı bağlanıyor...</p>
      </div>
    );
  }

  // Active chat
  if (chat) {
    return (
      <ActiveFabrikaChat
        chat={chat} expanded={expanded} setExpanded={setExpanded}
        onReset={handleReset} initialBrief={initialBrief} onOutput={onOutput}
      />
    );
  }

  // Landing — pre-chat
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Üretim Sohbeti</h3>
          <p className="text-[10px] text-muted-foreground">Brief yaz, FABRİKA asistanı üretsin.</p>
        </div>
      </div>

      {/* Starter pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {STARTERS.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.title}
              onClick={() => handleStartAndSend(s.prompt)}
              className="group bg-card/50 hover:bg-card rounded-xl border border-border p-3 text-left transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{s.emoji}</span>
                <Icon className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-xs font-medium">{s.title}</p>
            </button>
          );
        })}
      </div>

      {/* Custom brief input */}
      <div className="flex gap-2">
        <input
          className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          placeholder="Brief yaz... (örn: 'Psychedelic Anatolian Rock sanatçısı üret')"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="px-4 py-3 rounded-xl bg-amber-500 text-white disabled:opacity-40 transition-opacity hover:bg-amber-600"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export { FABRIKA_AGENT_ID };
