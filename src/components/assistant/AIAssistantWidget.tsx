import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Minus,
  Maximize2,
  GripHorizontal,
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
  const [isMinimized, setIsMinimized] = useState(false);
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

  // Vị trí kéo thả hộp thoại (null = mặc định góc dưới bên phải)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });
  const dialogRef = useRef<HTMLDivElement>(null);

  // Vị trí kéo thả nút tròn nổi (null = mặc định góc dưới bên phải)
  const [btnPosition, setBtnPosition] = useState<{ x: number; y: number } | null>(null);
  const btnDragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    mouseX: number;
    mouseY: number;
    moved: boolean;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    mouseX: 0,
    mouseY: 0,
    moved: false,
  });
  const floatingBtnRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen, isMinimized, messages, loading]);

  // Lắng nghe sự kiện mở từ Sidebar hoặc Settings
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('open-ai-assistant', handleOpen);
    return () => window.removeEventListener('open-ai-assistant', handleOpen);
  }, []);

  // Xử lý kéo thả Hộp thoại (Dialog Drag and Drop)
  const handleStartDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const isTouch = 'touches' in e.nativeEvent;
    const nativeTouch = isTouch ? (e.nativeEvent as TouchEvent).touches?.[0] : null;
    if (!isTouch && (e as React.MouseEvent).button !== 0) return; // Only left click

    const clientX = nativeTouch ? nativeTouch.clientX : (e as React.MouseEvent).clientX;
    const clientY = nativeTouch ? nativeTouch.clientY : (e as React.MouseEvent).clientY;

    const rect = dialogRef.current?.getBoundingClientRect();
    const currentX = rect ? rect.left : window.innerWidth - 490;
    const currentY = rect ? rect.top : window.innerHeight - 640;

    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      startX: currentX,
      startY: currentY,
    };

    const handleMove = (moveEv: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      const curTouch =
        'touches' in moveEv && moveEv.touches?.length ? moveEv.touches[0] : null;
      const curClientX = curTouch ? curTouch.clientX : (moveEv as MouseEvent).clientX;
      const curClientY = curTouch ? curTouch.clientY : (moveEv as MouseEvent).clientY;

      const deltaX = curClientX - dragStartRef.current.mouseX;
      const deltaY = curClientY - dragStartRef.current.mouseY;

      let nextX = dragStartRef.current.startX + deltaX;
      let nextY = dragStartRef.current.startY + deltaY;

      // Giới hạn trong khung nhìn màn hình
      const width = dialogRef.current?.offsetWidth || 440;
      const height = dialogRef.current?.offsetHeight || 500;
      nextX = Math.max(10, Math.min(window.innerWidth - width - 10, nextX));
      nextY = Math.max(10, Math.min(window.innerHeight - height - 10, nextY));

      setPosition({ x: nextX, y: nextY });
    };

    const handleEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
  }, []);

  // Xử lý kéo thả Nút tròn nổi (Floating Button Drag and Drop)
  const handleStartDragButton = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const isTouch = 'touches' in e.nativeEvent;
    const nativeTouch = isTouch ? (e.nativeEvent as TouchEvent).touches?.[0] : null;
    if (!isTouch && (e as React.MouseEvent).button !== 0) return;

    const clientX = nativeTouch ? nativeTouch.clientX : (e as React.MouseEvent).clientX;
    const clientY = nativeTouch ? nativeTouch.clientY : (e as React.MouseEvent).clientY;

    const rect = floatingBtnRef.current?.getBoundingClientRect();
    const currentX = rect ? rect.left : window.innerWidth - 80;
    const currentY = rect ? rect.top : window.innerHeight - 80;

    btnDragRef.current = {
      isDragging: true,
      startX: currentX,
      startY: currentY,
      mouseX: clientX,
      mouseY: clientY,
      moved: false,
    };

    const handleMove = (moveEv: MouseEvent | TouchEvent) => {
      if (!btnDragRef.current.isDragging) return;
      const curTouch =
        'touches' in moveEv && moveEv.touches?.length ? moveEv.touches[0] : null;
      const curClientX = curTouch ? curTouch.clientX : (moveEv as MouseEvent).clientX;
      const curClientY = curTouch ? curTouch.clientY : (moveEv as MouseEvent).clientY;

      const deltaX = curClientX - btnDragRef.current.mouseX;
      const deltaY = curClientY - btnDragRef.current.mouseY;

      if (Math.hypot(deltaX, deltaY) > 5) {
        btnDragRef.current.moved = true;
      }

      let nextX = btnDragRef.current.startX + deltaX;
      let nextY = btnDragRef.current.startY + deltaY;

      nextX = Math.max(10, Math.min(window.innerWidth - 70, nextX));
      nextY = Math.max(10, Math.min(window.innerHeight - 70, nextY));

      setBtnPosition({ x: nextX, y: nextY });
    };

    const handleEnd = () => {
      btnDragRef.current.isDragging = false;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
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
            <span className="w-2 h-2 rounded-full bg-[#EE3D43] mt-1.5 shrink-0" />
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
                    className="bg-slate-100 text-[#EE3D43] px-1.5 py-0.5 rounded text-xs font-mono font-bold border border-slate-200"
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
          1. CHAT DIALOG (Hỗ trợ Kéo-Thả tự do & Thu nhỏ / Ẩn gọn)
         ======================================================== */}
      {isOpen ? (
        isMinimized ? (
          /* TRẠNG THÁI THU NHỎ (Floating Mini Pill) */
          <div
            ref={dialogRef}
            style={
              position
                ? { left: `${position.x}px`, top: `${position.y}px` }
                : undefined
            }
            className={`fixed ${
              !position ? 'bottom-4 right-4 sm:bottom-6 sm:right-6' : ''
            } z-50 flex items-center gap-2.5 px-3.5 py-2.5 bg-[#1B2129] border border-[#30363d] text-white rounded-2xl shadow-2xl select-none animate-in fade-in zoom-in-95 duration-150`}
          >
            {/* Drag Handle */}
            <div
              onMouseDown={handleStartDrag}
              onTouchStart={handleStartDrag}
              className="cursor-move p-1 text-slate-400 hover:text-white"
              title="Kéo thả đến bất cứ đâu"
            >
              <GripHorizontal className="w-4 h-4" />
            </div>

            <div
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-[#EE3D43] text-white flex items-center justify-center text-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white">Trợ lý AI Kho</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="flex items-center gap-1 ml-1 border-l border-slate-700 pl-2">
              <button
                type="button"
                onClick={() => setIsMinimized(false)}
                title="Mở rộng hộp thoại"
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Đóng hoàn toàn"
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* TRẠNG THÁI MỞ ĐẦY ĐỦ (Full Dialog - Draggable Header) */
          <div
            ref={dialogRef}
            style={
              position
                ? {
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    bottom: 'auto',
                    right: 'auto',
                  }
                : undefined
            }
            className={`fixed ${
              !position ? 'bottom-4 right-4 sm:bottom-6 sm:right-6' : ''
            } z-50 w-[420px] sm:w-[480px] max-w-[calc(100vw-32px)] h-[620px] max-h-[calc(100vh-80px)] bg-white dark:bg-[#161b22] rounded-2xl shadow-2xl border border-slate-300/80 dark:border-[#30363d] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 select-text`}
          >
            {/* Header - Kéo Thả (Drag Handle) */}
            <div
              onMouseDown={handleStartDrag}
              onTouchStart={handleStartDrag}
              className="bg-[#1B2129] text-white p-3.5 px-4 flex items-center justify-between border-b border-[#262E38] shrink-0 cursor-move select-none"
              title="Giữ chuột và kéo để di chuyển hộp thoại"
            >
              <div className="flex items-center gap-3">
                <GripHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#EE3D43] to-rose-400 flex items-center justify-center text-white shadow-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#1B2129]" />
                </div>

                <div>
                  <h3 className="font-bold text-base tracking-tight text-white leading-tight">
                    Trợ lý kho AI
                  </h3>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Kéo thả di chuyển tự do • Tra cứu số liệu thực
                  </p>
                </div>
              </div>

              {/* Action buttons (Minimize, Reset, Close) */}
              <div
                className="flex items-center gap-1"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  title="Thu nhỏ thành thanh nổi gọn"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Đoạn chat mới"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Đóng hộp thoại"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#21262d] border border-slate-300 dark:border-[#30363d] hover:border-rose-300 dark:hover:border-rose-500 text-slate-800 dark:text-slate-200 hover:text-[#EE3D43] text-xs font-semibold whitespace-nowrap shadow-2xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
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
                          ? 'bg-[#EE3D43] text-white rounded-br-xs font-medium'
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
                  <Loader2 className="w-4 h-4 text-[#EE3D43] animate-spin" />
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
                  className="flex-1 bg-slate-100 dark:bg-[#21262d] border border-slate-300 dark:border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#EE3D43]/20 focus:border-[#EE3D43] transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-[#EE3D43] hover:bg-[#d63439] disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-xs"
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
        )
      ) : (
        /* ========================================================
            2. FLOATING CHAT BUBBLE (Bóng tròn nổi có thể kéo thả di chuyển tự do)
           ======================================================== */
        <div
          ref={floatingBtnRef}
          style={
            btnPosition
              ? { left: `${btnPosition.x}px`, top: `${btnPosition.y}px`, bottom: 'auto', right: 'auto' }
              : undefined
          }
          className={`fixed ${
            !btnPosition ? 'bottom-4 right-4 sm:bottom-6 sm:right-6' : ''
          } z-50 select-none cursor-move`}
          onMouseDown={handleStartDragButton}
          onTouchStart={handleStartDragButton}
        >
          <button
            type="button"
            onClick={(e) => {
              if (btnDragRef.current.moved) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="relative group p-4 rounded-2xl shadow-xl transition-transform duration-200 cursor-pointer flex items-center justify-center bg-gradient-to-r from-[#EE3D43] to-[#d63439] text-white hover:scale-105 active:scale-95 shadow-red-500/30"
            title="Kéo thả di chuyển hoặc nhấp để mở Trợ lý kho AI"
          >
            <Bot className="w-7 h-7 stroke-[2.2] pointer-events-none" />
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs pointer-events-none">
              <Sparkles className="w-3 h-3" />
            </span>

            {/* Tooltip khi hover */}
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-[#1B2129] text-white text-xs font-semibold rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700">
              Trợ lý kho AI (Kéo thả di chuyển) 🤖
            </span>
          </button>
        </div>
      )}
    </>
  );
};
