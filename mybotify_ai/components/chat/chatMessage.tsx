import React from "react";
import { Button } from "@/components/ui/button";
import { getUserRole } from "@/lib/auth";
import { FaRobot, FaUser } from "react-icons/fa";

type Props = {
  messages: { text: string; isUser: boolean }[];
};

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Enhanced parser handling markdown and custom tags
const MessageContent = ({ text }: { text: string }) => {
  // If the message contains the dashboard button token, split it out
  if (text.includes("[DASHBOARD_BUTTON]")) {
    const parts = text.split("[DASHBOARD_BUTTON]");
    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part.trim() && (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose prose-sm max-w-none text-[15px]"
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

  // Regular markdown rendering
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose prose-sm max-w-none text-[15px]"
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
            {msg.text === "Loading..." ? (
              <TypingIndicator />
            ) : (
              <MessageContent text={msg.text} />
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
