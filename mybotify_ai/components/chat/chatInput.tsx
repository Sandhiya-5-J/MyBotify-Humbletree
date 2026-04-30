import React, { useRef, useEffect } from "react";
import { IoSend } from "react-icons/io5";

type Props = {
  message: string;
  setMessage: (msg: string) => void;
  onSend: () => void;
};

const ChatInput = ({ message, setMessage, onSend }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="glow-input rounded-2xl flex items-end bg-white p-3 border border-gray-200 shadow-lg transition-all duration-300">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        className="flex-1 outline-none resize-none caret-[#2e3e48] rounded-xl overflow-y-auto p-3 text-[15px] no-scrollbar whitespace-pre-wrap placeholder:text-gray-400"
        placeholder="Ask me anything about your store..."
        style={{ maxHeight: "120px" }}
      />
      <button
        onClick={onSend}
        disabled={!message.trim()}
        className="ml-2 w-10 h-10 flex items-center justify-center rounded-full bg-[#2e3e48] text-white hover:bg-[#1a2830] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
        aria-label="Send message"
      >
        <IoSend className="text-lg" />
      </button>
    </div>
  );
};

export default ChatInput;
