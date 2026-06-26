import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import { CHATBOT_RESPONSES, INTENT_MAP } from '../data';
import { ActivePage } from '../types';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: ActivePage, param?: string) => void;
  onSetCategory: (category: string) => void;
  showToast: (msg: string) => void;
}

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSetCategory,
  showToast
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greetData = CHATBOT_RESPONSES.greet;
      setMessages([{ sender: 'bot', text: greetData.msg }]);
      setQuickReplies(greetData.replies);
    }
  }, []);

  // Scroll to bottom on updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleAction = (action: string) => {
    setTimeout(() => {
      if (action === 'wa') {
        try {
          window.open(
            'https://wa.me/919414067123?text=Namaste%20Snehsarees!%20I%20would%20like%20to%20know%20more%20about%20your%20sarees.',
            '_blank'
          );
        } catch (e) {
          console.error('Chatbot WhatsApp launch error:', e);
          showToast('Failed to open WhatsApp. Please enable popups.');
        }
      } else {
        // 'silk' | 'cotton' | 'wedding'
        const categoryName = action.charAt(0).toUpperCase() + action.slice(1);
        onSetCategory(categoryName);
        onNavigate('home');
        onClose();
        showToast(`Filtered by ${categoryName}`);
      }
    }, 800);
  };

  const getBotResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    let key = '';

    // 1. Direct intent mapping first (so specific inputs like "shop cotton" get priority)
    for (const [phrase, intent] of Object.entries(INTENT_MAP)) {
      if (lowerInput.includes(phrase)) {
        key = intent;
        break;
      }
    }

    // 2. Keyword fallback checks if no exact intent was mapped
    if (!key) {
      if (lowerInput.includes('silk')) {
        key = 'silk';
      } else if (lowerInput.includes('cotton')) {
        key = 'cotton';
      } else if (
        lowerInput.includes('wedding') ||
        lowerInput.includes('bridal')
      ) {
        key = 'wedding';
      } else if (lowerInput.includes('deliver') || lowerInput.includes('ship')) {
        key = 'delivery';
      } else if (lowerInput.includes('order') || lowerInput.includes('track')) {
        key = 'order';
      } else if (
        lowerInput.includes('contact') ||
        lowerInput.includes('call') ||
        lowerInput.includes('phone')
      ) {
        key = 'contact';
      } else if (lowerInput.includes('whatsapp')) {
        key = 'whatsapp';
      } else if (lowerInput.includes('browse') || lowerInput.includes('saree')) {
        key = 'browse';
      } else {
        key = 'fallback';
      }
    }

    const data = CHATBOT_RESPONSES[key];
    setMessages((prev) => [...prev, { sender: 'bot', text: data.msg }]);
    setQuickReplies(data.replies);

    if (data.action) {
      handleAction(data.action);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputValue.trim();
    if (!text) return;

    if (textToSend === undefined) {
      setInputValue('');
    }

    // Append user message
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setQuickReplies([]);

    // Get bot response after a tiny delay
    setTimeout(() => {
      getBotResponse(text);
    }, 450);
  };

  const handleQuickReplyClick = (reply: string) => {
    handleSendMessage(reply);
  };

  if (!isOpen) return null;

  return (
    <div
      id="chatbot-panel"
      className="chatbot-panel fixed right-3 bottom-[80px] md:right-4 md:bottom-[92px] w-[300px] bg-white rounded-3xl shadow-2xl border border-[#E8E0D5] z-[199] flex flex-col overflow-hidden max-h-[420px]"
    >
      {/* Header */}
      <div className="chatbot-header bg-[#7B1C2E] p-3 px-4 flex items-center gap-2.5">
        <div className="chatbot-avatar w-[34px] h-[34px] rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="chatbot-header-info flex-1">
          <div className="chatbot-name text-white font-bold text-[13px]">Sneh Assistant</div>
          <div className="chatbot-status text-[10px] text-white/75 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            Online · Replies instantly
          </div>
        </div>
        <button
          className="chatbot-close text-white/80 hover:text-white font-serif text-2xl leading-none"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="chatbot-messages flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-[#FAF6F0] min-h-0">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`chat-msg max-w-[85%] px-3 py-2 rounded-[14px] text-xs leading-relaxed whitespace-pre-line ${
              m.sender === 'bot'
                ? 'bg-white border border-[#E8E0D5] text-[#1A1A1A] rounded-bl-none self-start shadow-2xs'
                : 'bg-[#7B1C2E] text-white rounded-br-none self-end shadow-2xs'
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {quickReplies.length > 0 && (
        <div className="chat-quick-replies flex flex-wrap gap-1.5 p-3 pt-1.5 bg-[#FAF6F0] shrink-0">
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              className="quick-reply text-[11px] font-semibold text-[#7B1C2E] border-1.5 border-[#7B1C2E] rounded-full px-2.5 py-1.5 hover:bg-[#7B1C2E] hover:text-white transition-all cursor-pointer"
              onClick={() => handleQuickReplyClick(reply)}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chatbot-input-row flex items-center gap-2 p-2.5 border-t border-[#E8E0D5] bg-white shrink-0">
        <input
          className="chatbot-input flex-1 border border-[#E8E0D5] rounded-full px-3 py-1.5 text-xs outline-none bg-[#FAF6F0] focus:border-[#7B1C2E]"
          id="chatbot-input"
          type="text"
          placeholder="Type a message…"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
        <button
          className="chatbot-send w-8 h-8 rounded-full bg-[#7B1C2E] flex items-center justify-center shrink-0 hover:bg-[#9B2840] transition-colors cursor-pointer"
          onClick={() => handleSendMessage()}
        >
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  );
};
