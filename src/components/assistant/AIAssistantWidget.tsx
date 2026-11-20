import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Building2,
  AlertTriangle,
  ArrowLeftRight,
  PackageSearch,
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
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    label: 'Mặt hàng nào sắp hết?',
    prompt: 'Kiểm tra giúp tôi các mặt hàng đang chạm ngưỡng tồn kho tối thiểu hoặc hết hàng?',
  },
  {
    icon: <Building2 className="w-3.5 h-3.5 text-blue-500" />,
    label: 'Danh sách các kho?',
    prompt: 'Cho tôi biết danh sách và sức chứa các kho hàng hiện có?',
  },
  {
    icon: <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-500" />,
    label: 'Giao dịch gần nhất?',
    prompt: 'Liệt kê 5 giao dịch xuất / nhập kho phát sinh gần đây nhất?',
  },
  {
    icon: <PackageSearch className="w-3.5 h-3.5 text-purple-500" />,
    label: 'Tra cứu tồn kho',
    prompt: 'Tra cứu số lượng tồn kho chi tiết của các sản phẩm chủ lực?',
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
      content: `Xin chào **${user?.display_name || user?.username || 'bạn'}**! 👋\n\nTôi là **Trợ lý AI Quản Lý Kho Hàng** (IMS Assistant). Tôi hoạt động theo cơ chế **Stateless** và được kết nối trực tiếp với cơ sở dữ liệu thời gian thực của hệ thống.\n\nBạn có thể hỏi tôi tra cứu tồn kho, tìm sản phẩm, kiểm tra hàng sắp hết hoặc số liệu xuất nhập!`,
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
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, loading]);

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'model',
        content: `Đoạn hội thoại đã được **làm mới hoàn toàn** (Stateless Reset). Bạn muốn tra cứu hay kiểm tra dữ liệu kho nào tiếp theo?`,
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
      // Chuẩn bị lịch sử theo format ChatHistoryItem[]
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render text with basic markdown formatting
  const renderFormattedContent = (content: string) => {
    // Tách dòng
    const lines = content.split('\n');

    return lines.map((line, lIdx) => {
      // Dòng trống
      if (!line.trim()) {
        return <div key={lIdx} className="h-2" />;
      }

      // Xử lý Markdown bold (**text**) và inline code (`code`)
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);

      return (
        <p key={lIdx} className="leading-relaxed mb-1 last:mb-0">
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
                  className="bg-slate-200/80 text-rose-600 px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold"
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <>
      {/* ========================================================
          1. CHAT WINDOW (Popup nổi góc dưới bên phải)
         ======================================================== */}
      {isOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-50 w-[380px] sm:w-[440px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 select-text">
          {/* Header */}
          <div className="bg-[#1B2129] text-white p-3.5 px-4 flex items-center justify-between border-b border-[#262E38] shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#EE3D43] to-rose-400 flex items-center justify-center text-white shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#1B2129]" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-white">
                    Trợ lý kho AI
                  </span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono px-1.5 py-0.2 rounded-full font-semibold">
                    Stateless
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {user?.role === 'ADMIN'
                    ? 'Quyền Quản trị viên · Toàn quyền số liệu'
                    : user?.role === 'MANAGER'
                    ? 'Quyền Quản lý kho'
                    : 'Quyền Nhân viên vận hành'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Làm mới hội thoại (Reset Stateless)"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Thu nhỏ"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips (Gợi ý câu hỏi nhanh) */}
          <div className="bg-slate-50 border-b border-slate-200/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-xs font-medium whitespace-nowrap shadow-2xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                {qp.icon}
                <span>{qp.label}</span>
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-slate-50/50">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 shadow-2xs ${
                      isUser
                        ? 'bg-[#EE3D43] text-white rounded-br-xs font-medium'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    ) : (
                      <div className="space-y-1">
                        {renderFormattedContent(m.content)}

                        {/* Tool Calls Badge */}
                        {m.toolCalls && m.toolCalls.length > 0 && (
                          <div className="pt-2 mt-2 border-t border-slate-100 flex flex-wrap gap-1">
                            {m.toolCalls.map((tc, tIdx) => (
                              <span
                                key={tIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono border border-slate-200"
                                title={`Dữ liệu: ${JSON.stringify(tc.args)}`}
                              >
                                <Database className="w-2.5 h-2.5 text-emerald-600" />
                                {tc.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
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
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 w-fit shadow-2xs">
                <Loader2 className="w-4 h-4 text-[#EE3D43] animate-spin" />
                <span className="font-medium">Trợ lý AI đang truy vấn dữ liệu kho...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi trợ lý kho (ví dụ: SKU-001 còn bao nhiêu cái?)..."
                disabled={loading}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:border-[#EE3D43] transition-all"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl bg-[#EE3D43] hover:bg-[#d63439] disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-xs"
                title="Gửi câu hỏi"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1">
              <span>Enter để gửi · Giao tiếp Stateless</span>
              <span className="flex items-center gap-1 font-medium text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. FLOATING CHAT BUBBLE (Bóng chat góc dưới bên phải)
         ======================================================== */}
      <div className="fixed bottom-6 right-6 z-50 select-none">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group p-3.5 rounded-2xl shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center ${
            isOpen
              ? 'bg-[#1B2129] text-white rotate-90 scale-95'
              : 'bg-gradient-to-r from-[#EE3D43] to-[#d63439] text-white hover:scale-105 active:scale-95 shadow-red-500/25'
          }`}
          title={isOpen ? 'Đóng trợ lý AI' : 'Mở Trợ lý AI Quản Lý Kho Hàng'}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-6 h-6 stroke-[2.2]" />
              {/* Sparkle badge */}
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center text-[9px] font-bold shadow-xs animate-bounce">
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            </>
          )}

          {/* Tooltip khi chưa mở */}
          {!isOpen && (
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-[#1B2129] text-white text-xs font-semibold rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700">
              Trợ lý AI Kho hàng 🤖
            </span>
          )}
        </button>
      </div>
    </>
  );
};
