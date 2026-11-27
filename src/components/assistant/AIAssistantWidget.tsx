import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  RotateCcw,
  Sparkles,
  Building2,
  AlertTriangle,
  ArrowLeftRight,
  TrendingUp,
  Database,
  Loader2,
} from 'lucide-react';
import { assistantService, ChatHistoryItem, AssistantToolCall } from '../../services/assistant.service';
import { useAuthStore } from '../../stores/auth.store';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  toolCalls?: AssistantToolCall[];
  timestamp: Date;
}

const QUICK_PROMPTS = [
  {
    icon: <TrendingUp className="w-3.5 h-3.5 text-rose-500" />,
    label: 'Hàng tồn nhiều nhất',
    prompt: 'Mặt hàng nào đang có số lượng tồn kho nhiều nhất trong toàn bộ hệ thống?',
  },
  {
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    label: 'Mặt hàng sắp hết',
    prompt: 'Kiểm tra giúp tôi các mặt hàng đang chạm ngưỡng tồn kho tối thiểu hoặc hết hàng?',
  },
  {
    icon: <Building2 className="w-3.5 h-3.5 text-blue-500" />,
    label: 'Danh sách các kho',
    prompt: 'Cho tôi biết danh sách và thông tin các kho hàng hiện có?',
  },
  {
    icon: <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-500" />,
    label: 'Giao dịch gần nhất',
    prompt: 'Liệt kê các giao dịch xuất / nhập kho phát sinh gần đây nhất?',
  },
];

export const AIAssistantWidget: React.FC = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Xin chào **${user?.display_name || user?.username || 'bạn'}**! 👋\n\nTôi là **Trợ lý kho AI**. Tôi có thể hỗ trợ bạn tra cứu nhanh tồn kho, tìm sản phẩm, kiểm tra mặt hàng tồn nhiều nhất, hàng sắp hết hoặc số liệu xuất nhập kho.\n\nBạn cần hỗ trợ tra cứu thông tin gì hôm nay?`,
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen, messages, loading]);

  // Lắng nghe sự kiện mở từ Sidebar hoặc Settings
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-ai-assistant', handleOpen);
    return () => window.removeEventListener('open-ai-assistant', handleOpen);
  }, []);

  // Đóng khi bấm phím Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'model',
        content: `Đoạn hội thoại đã được làm mới. Bạn cần hỗ trợ tra cứu thông tin kho nào tiếp theo?`,
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload: ChatHistoryItem[] = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await assistantService.chat(text, historyPayload);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.reply,
        toolCalls: response.tool_calls,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content:
          '⚠️ Rất tiếc, đã xảy ra lỗi trong quá trình xử lý câu hỏi. Vui lòng thử lại sau giây lát hoặc làm mới hội thoại.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render markdown with larger font, clear bullets, bold text, code
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return lines.map((line, lIdx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={lIdx} className="h-2" />;
      }

      // Gạch đầu dòng / bullet point (* hoặc -)
      const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ');
      const rawText = isBullet ? trimmed.slice(2) : line;

      // Xử lý Markdown bold (**text**) và inline code (`code`)
      const parts = rawText.split(/(\*\*.*?\*\*|`.*?`)/g);

      return (
        <div
          key={lIdx}
          className={`leading-relaxed mb-1.5 last:mb-0 text-sm text-slate-800 ${
            isBullet ? 'flex items-start gap-2 pl-1' : ''
          }`}
        >
          {isBullet && (
            <span className="w-2 h-2 rounded-full bg-[#294238] mt-1.5 shrink-0" />
          )}
          <p className="flex-1">
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-bold text-slate-900">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <code
                    key={pIdx}
                    className="bg-slate-100 text-[#294238] px-1.5 py-0.5 rounded text-xs font-mono font-bold border border-slate-200"
                  >
                    {part.slice(1, -1)}
                  </code>
                );
              }
              return part;
            })}
          </p>
        </div>
      );
    });
  };

  return (
    <>
      {/* ========================================================
          1. CHAT DIALOG (Cố định bên trái nút Bot AI)
         ======================================================== */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-[88px] z-50 w-[calc(100vw-32px)] sm:w-[460px] h-[580px] max-h-[calc(100vh-100px)] bg-white dark:bg-[#161b22] rounded-2xl shadow-2xl border border-slate-300/80 dark:border-[#384252] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 sm:slide-in-from-right-4 zoom-in-95 duration-200 select-text"
        >
          {/* Header */}
          <div className="bg-[#1B2129] text-white p-3.5 px-4 flex items-center justify-between border-b border-[#262E38] shrink-0 select-none">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#294238] border border-[#467360] flex items-center justify-center text-white shadow-xs">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#1B2129]" />
              </div>

              <div>
                <h3 className="font-bold text-sm tracking-tight text-white leading-tight">
                  Trợ lý kho AI
                </h3>
                <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                  Tra cứu dữ liệu kho thời gian thực
                </p>
              </div>
            </div>

            {/* Action buttons (Reset, Dấu X nhỏ trên góc để tắt) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Làm mới cuộc trò chuyện"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Đóng hộp thoại"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
            <div className="bg-slate-50 dark:bg-[#0d1117] border-b border-slate-200 dark:border-[#30363d] px-3 py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(qp.prompt)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white dark:bg-[#21262d] border border-slate-300 dark:border-[#30363d] hover:border-[#527565] text-slate-800 dark:text-slate-200 hover:text-[#294238] text-xs font-semibold whitespace-nowrap shadow-2xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {qp.icon}
                  <span>{qp.label}</span>
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar bg-slate-50/60 dark:bg-[#0d1117]">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                        isUser
                          ? 'bg-[#294238] text-white rounded-br-xs font-medium'
                          : 'bg-white dark:bg-[#161b22] border border-slate-200/90 dark:border-[#30363d] text-slate-900 dark:text-slate-100 rounded-bl-xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                      ) : (
                        <div className="space-y-1.5">
                          {renderFormattedContent(m.content)}

                          {/* Tool Calls Badge */}
                          {m.toolCalls && m.toolCalls.length > 0 && (
                            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-[#30363d] flex flex-wrap gap-1.5">
                              {m.toolCalls.map((tc, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#21262d] text-slate-700 dark:text-slate-300 text-xs font-mono font-medium border border-slate-200 dark:border-[#30363d]"
                                >
                                  <Database className="w-3 h-3 text-emerald-600" />
                                  {tc.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-medium mt-1 px-1">
                      {new Date(m.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl px-4 py-3 w-fit shadow-xs font-medium">
                  <Loader2 className="w-4 h-4 text-[#294238] animate-spin" />
                  <span>Đang truy vấn số liệu thực tế...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3.5 bg-white dark:bg-[#161b22] border-t border-slate-200 dark:border-[#30363d] shrink-0">
              <div className="flex items-center gap-2.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Hỏi trợ lý (ví dụ: Mặt hàng nào tồn kho nhiều nhất?)..."
                  disabled={loading}
                  className="flex-1 bg-slate-100 dark:bg-[#21262d] border border-slate-300 dark:border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#294238]/20 focus:border-[#294238] transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-sm bg-[#294238] hover:bg-[#20372e] disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-xs"
                  title="Gửi câu hỏi"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mt-2 px-1">
                <span>Nhấn Enter để gửi câu hỏi</span>
                <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Trực tuyến
                </span>
              </div>
            </div>
          </div>
        )}

      {/* ========================================================
          2. FLOATING BOT BUTTON (Cố định góc dưới bên phải)
         ======================================================== */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 select-none">
        <button
          type="button"
          data-round="true"
          onClick={() => setIsOpen(!isOpen)}
          className="relative group w-14 h-14 rounded-full shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center bg-[#294238] hover:bg-[#20372e] border border-[#467360]/60 text-white hover:scale-105 active:scale-95"
          title={isOpen ? 'Đóng Trợ lý kho AI' : 'Mở Trợ lý kho AI'}
        >
          {isOpen ? (
            <X className="w-6 h-6 stroke-[2.2]" />
          ) : (
            <>
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center text-[9px] font-bold shadow-xs">
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            </>
          )}

          {/* Tooltip khi chưa mở */}
          {!isOpen && (
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-[#1B2129] text-white text-xs font-semibold rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700">
              Trợ lý kho AI 🤖
            </span>
          )}
        </button>
      </div>
    </>
  );
};
