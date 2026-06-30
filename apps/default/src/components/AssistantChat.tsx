import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { createConversation, createAgentChat } from '@/lib/agent-chat/v2';
import { isToolUIPart } from 'ai';
import type { UIMessage } from 'ai';
import { ulid } from 'ulidx';
import { AGENT_ID } from '@/lib/api';
import { Bot, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import {
  Confirmation,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
} from '@/components/ai-elements/confirmation';
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from '@/components/ai-elements/prompt-input';
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion';

/* ─── Messages Parts Renderer ─── */
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
            ? <p key={key}>{part.text}</p>
            : <MessageResponse key={key}>{part.text}</MessageResponse>;
        }
        if (isToolUIPart(part)) {
          return (
            <Tool key={key}>
              <ToolHeader type={part.type} state={part.state} />
              <ToolContent>
                <ToolInput input={part.input} />
                <Confirmation approval={part.approval} state={part.state}>
                  <ConfirmationRequest>
                    <ConfirmationTitle>Bu aracı çalıştırmak istiyor musunuz?</ConfirmationTitle>
                  </ConfirmationRequest>
                  <ConfirmationAccepted>Onaylandı</ConfirmationAccepted>
                  <ConfirmationRejected>Reddedildi</ConfirmationRejected>
                  <ConfirmationActions>
                    <ConfirmationAction
                      variant="outline"
                      onClick={() => part.approval != null && onApprove({ id: part.approval.id, approved: false })}
                    >
                      Reddet
                    </ConfirmationAction>
                    <ConfirmationAction
                      onClick={() => part.approval != null && onApprove({ id: part.approval.id, approved: true })}
                    >
                      Onayla
                    </ConfirmationAction>
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

/* ─── Active Chat (after conversation created) ─── */
function ActiveChat({ chat }: { chat: ReturnType<typeof createAgentChat> }) {
  const { messages, status, addToolApprovalResponse } = useChat({ chat, id: chat.id });
  const isSending = status === 'submitted' || status === 'streaming';
  const hasMessages = messages.length > 0;

  const handleSend = async (text: string) => {
    await chat.sendMessage({ id: ulid(), role: 'user', parts: [{ type: 'text', text }] });
  };

  return (
    <div className="module-transition flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold">Zo — MİHENK Asistan</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className={cn('w-1.5 h-1.5 rounded-full', isSending ? 'bg-amber-500 animate-pulse' : 'bg-green-500')} />
            {isSending ? 'Yanıtlıyor...' : 'Çevrimiçi'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <Conversation className="flex-1 min-h-0">
        <ConversationContent>
          {!hasMessages && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">Merhaba! 👋 Projelerin, finansın, müzik kataloğun ve wellness rutinin için buradayım.</p>
            </div>
          )}
          {messages.map((msg) => (
            <Message key={msg.id} from={msg.role}>
              <MessageContent>
                <MessageParts message={msg} onApprove={addToolApprovalResponse} />
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Starter Suggestions */}
      {!hasMessages && (
        <Suggestions className="flex-shrink-0 mb-2">
          <Suggestion suggestion="Bugünün özetini ver — acil görevler, etkinlikler, finans ve wellness." onClick={handleSend} />
          <Suggestion suggestion="Müzik kataloğumdaki sanatçıları ve pipeline'daki track'leri özetle." onClick={handleSend} />
          <Suggestion suggestion="Acil ve yüksek öncelikli görevlerimi listele." onClick={handleSend} />
          <Suggestion suggestion="Bu ayki gelir-gider durumumu analiz et." onClick={handleSend} />
        </Suggestions>
      )}

      {/* Input */}
      <PromptInput onSubmit={({ text }) => { if (text) handleSend(text); }} className="flex-shrink-0">
        <PromptInputTextarea placeholder="Mesajınızı yazın..." />
        <PromptInputFooter>
          <PromptInputSubmit status={status} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}

/* ─── Wrapper: Handles conversation creation ─── */
export default function AssistantChat() {
  const [chat, setChat] = useState<ReturnType<typeof createAgentChat> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleStartChat = async () => {
    setIsCreating(true);
    try {
      const { conversationId } = await createConversation(AGENT_ID);
      setChat(createAgentChat(AGENT_ID, conversationId));
    } catch (e) {
      console.error('Failed to create conversation:', e);
    } finally {
      setIsCreating(false);
    }
  };

  // Not yet started — show landing screen
  if (!chat) {
    return (
      <div className="module-transition flex flex-col items-center justify-center h-[calc(100vh-120px)]">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Zo — MİHENK Asistan</h2>
          <p className="text-muted-foreground mb-2">
            Projelerinden finansına, müzik kataloğundan wellness rutinine kadar her konuda yardımcı olurum.
          </p>
          <p className="text-[10px] text-muted-foreground/60 mb-8">
            Görev oluştururum, veri ararım, analiz yaparım, iş akışı tetiklerim.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { emoji: '📋', title: 'Görev Yönetimi', desc: 'Oluştur, ara, güncelle' },
              { emoji: '💰', title: 'Finans Takibi', desc: 'Gelir-gider analizi' },
              { emoji: '🎵', title: 'Müzik Kataloğu', desc: 'Sanatçı, albüm, track' },
              { emoji: '📊', title: 'Sistem Raporu', desc: 'Günlük/haftalık özet' },
            ].map((s) => (
              <div key={s.title} className="p-3 bg-card rounded-xl border border-border text-left">
                <span className="text-lg mb-1 block">{s.emoji}</span>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartChat}
            disabled={isCreating}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto disabled:opacity-50 shadow-lg shadow-amber-500/20"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Sohbete Başla
          </button>
        </div>
      </div>
    );
  }

  return <ActiveChat chat={chat} />;
}
