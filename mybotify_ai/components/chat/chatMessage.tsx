import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { getUserRole } from "@/lib/auth";
import { FaRobot, FaUser, FaChevronDown, FaChevronUp, FaCogs } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  text: string;
  isUser: boolean;
  steps?: { agent: string; content: string }[];
};

type Props = {
  messages: Message[];
};

const AgentTraceTimeline = ({ steps }: { steps: { agent: string; content: string }[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!steps || steps.length === 0) return null;

  const getAgentColor = (agent: string) => {
    switch (agent.toLowerCase()) {
      case "planner":
        return "bg-slate-700 border-slate-800 text-white";
      case "researcher":
        return "bg-purple-100 border-purple-200 text-purple-800";
      case "content":
        return "bg-pink-100 border-pink-200 text-pink-800";
      case "ads":
        return "bg-blue-100 border-blue-200 text-blue-800";
      case "analytics":
        return "bg-amber-100 border-amber-200 text-amber-800";
      case "account":
        return "bg-emerald-100 border-emerald-200 text-emerald-800";
      default:
        return "bg-gray-100 border-gray-200 text-gray-800";
    }
  };

  return (
    <div className="mt-3 mb-2 border border-gray-200/80 rounded-xl bg-gray-50/50 overflow-hidden shadow-sm transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-[#2e3e48] hover:bg-gray-100/50 transition-colors focus:outline-none"
      >
        <span className="flex items-center gap-2">
          <FaCogs 
            className="text-[#2e3e48] text-sm animate-spin" 
            style={{ animationDuration: isOpen ? '10s' : '0s' }} 
          />
          AI THINK-CHAIN PROCESS ({steps.length} Steps)
        </span>
        {isOpen ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-200/60 space-y-4 max-h-[300px] overflow-y-auto no-scrollbar animate-fadeIn">
          <div className="relative border-l border-gray-300/80 ml-3 pl-4 space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Timeline dot */}
                <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full border border-white bg-[#CAF389] shadow-sm flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-[#2e3e48] rounded-full" />
                </span>
                
                {/* Header */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${getAgentColor(step.agent)}`}>
                    {step.agent} Agent
                  </span>
                  <span className="text-[9px] text-gray-400 font-semibold">Step {idx + 1}</span>
                </div>
                
                {/* Thinking bubble */}
                <div className="bg-white border border-gray-100 rounded-lg p-2.5 text-[11px] text-gray-600 shadow-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {step.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced parser handling markdown and custom tags
const MessageContent = ({ text }: { text: string }) => {
  if (text.includes("[DASHBOARD_BUTTON]")) {
    const parts = text.split("[DASHBOARD_BUTTON]");
    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part.trim() && (
              <div className="prose prose-sm max-w-none text-[15px]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, ...props }) => {
                      const isMyBotify = props.href?.includes("mybotify");
                      const label = isMyBotify ? "Sign up" : props.children;
                      const url = isMyBotify ? "https://mybotify.com/signup" : props.href;
                      return (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                          <Button className="text-sm px-4 py-1 rounded-full">{label}</Button>
                        </a>
                      );
                    }
                  }}
                >
                  {part}
                </ReactMarkdown>
              </div>
            )}
            {index < parts.length - 1 && (
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  const role = getUserRole();
                  window.location.href = role === "admin" ? "/admin" : "/account";
                }} 
                className="inline-block mt-4 w-full"
              >
                <Button className="bg-[#162120] text-white rounded-3xl px-6 w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </a>
            )}
          </React.Fragment>
        ))}
      </>
    );
  }

  return (
    <div className="prose prose-sm max-w-none text-[15px]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => {
            const isMyBotify = props.href?.includes("mybotify");
            const label = isMyBotify ? "Sign up" : props.children;
            const url = isMyBotify ? "https://mybotify.com/signup" : props.href;
            return (
              <a href={url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                <Button className="text-sm px-4 py-1 rounded-full">{label}</Button>
              </a>
            );
          }
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-2 py-1">
    <div className="w-2 h-2 bg-[#2e3e48] rounded-full animate-pulse-dot" style={{ animationDelay: "0s" }} />
    <div className="w-2 h-2 bg-[#2e3e48] rounded-full animate-pulse-dot" style={{ animationDelay: "0.2s" }} />
    <div className="w-2 h-2 bg-[#2e3e48] rounded-full animate-pulse-dot" style={{ animationDelay: "0.4s" }} />
  </div>
);

const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatMessages = ({ messages }: Props) => (
  <div className="flex-1 p-4 space-y-1 flex flex-col-reverse items-stretch overflow-y-auto no-scrollbar whitespace-pre-line">
    {messages.map((msg, index) => (
      <div
        key={index}
        className={`flex items-end gap-2 my-1.5 animate-slide-up ${
          msg.isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            msg.isUser
              ? "bg-[#2e3e48] text-white"
              : "bg-[#CAF389] text-[#2e3e48]"
          }`}
        >
          {msg.isUser ? (
            <FaUser className="text-xs" />
          ) : (
            <FaRobot className="text-sm" />
          )}
        </div>

        {/* Bubble */}
        <div className="flex flex-col max-w-[70%]">
          <div
            className={`px-4 py-2.5 text-[15px] leading-relaxed ${
              msg.isUser ? "chat-bubble-user" : "chat-bubble-bot text-[#2e3e48]"
            } break-words whitespace-pre-line overflow-hidden`}
          >
            {msg.text === "Loading..." && (!msg.steps || msg.steps.length === 0) ? (
              <TypingIndicator />
            ) : (
              <>
                {msg.text !== "Loading..." && <MessageContent text={msg.text} />}
                {msg.steps && msg.steps.length > 0 && <AgentTraceTimeline steps={msg.steps} />}
              </>
            )}
          </div>
          <span
            className={`text-[10px] text-gray-400 mt-1 ${
              msg.isUser ? "text-right mr-1" : "ml-1"
            }`}
          >
            {formatTime()}
          </span>
        </div>
      </div>
    ))}
  </div>
);

export default ChatMessages;
