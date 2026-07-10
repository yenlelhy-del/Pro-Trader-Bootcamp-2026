/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, AlertCircle, RefreshCw, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export default function AICoach() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Xin chào! Tôi là **Coach AI** - Cố vấn kỷ luật và quản trị rủi ro của bạn tại **Pro Trader Bootcamp 2026**. Tôi có thể giúp bạn hiểu rõ các luật giao dịch, tính toán vị thế tối ưu hoặc tư vấn về tư duy giao dịch chuyên nghiệp. Hãy thử chọn một câu hỏi gợi ý bên dưới nhé!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const suggestions = [
    "Quy tắc Vòng 1 cụ thể là gì?",
    "Hạn mức & quyền lợi Vòng 2?",
    "Quy tắc đa dạng hóa Max 40%?",
    "Cách tính số lượng cổ phiếu mua?",
    "Quy tắc nhất quán là gì?"
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setError("");
    const userMessage = textToSend;
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(msg => ({
            role: msg.role === "model" ? "model" : "user",
            text: msg.text
          }))
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        // Response is not JSON
      }

      if (!response.ok) {
        throw new Error(data?.error || "Lỗi kết nối API. Vui lòng kiểm tra API Key.");
      }

      if (data && data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể kết nối đến máy chủ AI. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  // Helper to format text (basic markdown-like bold text support)
  const formatText = (text: string) => {
    return text.split("\n").map((line, lineIdx) => {
      // Bold text formatting **text**
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const renderedLine = parts.map((part, partIdx) => {
        if (partIdx % 2 === 1) {
          return <strong key={partIdx} className="text-primary-neon font-bold">{part}</strong>;
        }
        return part;
      });

      return (
        <p key={lineIdx} className={lineIdx > 0 ? "mt-1.5" : ""}>
          {renderedLine}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-surface border border-primary-neon/40 text-primary-neon flex items-center justify-center shadow-[0_0_20px_rgba(0,230,118,0.25)] hover:border-primary-neon transition-all cursor-pointer relative overflow-hidden group"
          aria-label="Chat with AI Coach"
        >
          {/* Subtle spinning background layer */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-neon/10 to-transparent group-hover:rotate-180 transition-transform duration-1000"></div>
          {isOpen ? (
            <X className="w-6 h-6 relative z-10" />
          ) : (
            <div className="relative z-10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary-neon animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary-neon border border-background"></span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[580px] rounded-3xl bg-surface border border-outline-custom/40 shadow-2xl flex flex-col overflow-hidden z-50 glass-nav"
          >
            {/* Header */}
            <div className="p-4 border-b border-outline-custom/20 bg-background/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-neon/10 border border-primary-neon/30 flex items-center justify-center text-primary-neon">
                  <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-white font-headline text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    Coach AI
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-neon animate-pulse"></span>
                  </h4>
                  <p className="text-[10px] text-muted-steel font-medium">Trợ lý Kỷ luật & Quản trị Rủi ro</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-steel hover:text-white p-1 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages View */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary-neon text-[#002114] font-bold rounded-tr-none shadow-[0_4px_12px_rgba(0,230,118,0.15)]"
                        : "bg-surface-bright/80 border border-outline-custom/30 text-on-background rounded-tl-none"
                    }`}
                  >
                    {formatText(msg.text)}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-bright/80 border border-outline-custom/30 rounded-2xl rounded-tl-none p-3 text-xs text-muted-steel flex items-center gap-1.5">
                    <span className="font-bold">Coach AI đang gõ</span>
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 bg-muted-steel rounded-full animate-bounce delay-0"></span>
                      <span className="w-1 h-1 bg-muted-steel rounded-full animate-bounce delay-150"></span>
                      <span className="w-1 h-1 bg-muted-steel rounded-full animate-bounce delay-300"></span>
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-error-neon/30 text-error-neon text-[11px] p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{error}</span>
                  <button
                    onClick={() => setError("")}
                    className="p-1 hover:bg-error-neon/10 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Suggestions Footer */}
            <div className="px-4 py-2 border-t border-outline-custom/10 bg-background/30">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(sug)}
                    className="flex-shrink-0 bg-background hover:bg-surface-bright border border-outline-custom/40 hover:border-primary-neon text-[10px] font-bold text-on-surface-variant hover:text-primary-neon px-3 py-1.5 rounded-lg transition-all cursor-pointer font-sans"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input Bar */}
            <div className="p-3 border-t border-outline-custom/20 bg-background/80 flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi cho Coach AI..."
                className="flex-1 bg-background border border-outline-custom/40 rounded-xl px-4 py-2.5 text-white text-xs focus:border-primary-neon outline-none font-sans"
              />
              <button
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                  inputValue.trim() && !isLoading
                    ? "bg-primary-neon text-[#002114] hover:brightness-110 shadow-lg"
                    : "bg-outline-custom/20 text-on-surface-variant/40 border border-outline-custom/30 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
