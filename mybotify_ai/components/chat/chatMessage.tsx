import React from "react";
import { Button } from "@/components/ui/button";
import { getUserRole } from "@/lib/auth";

type Props = {
  messages: { text: string; isUser: boolean }[];
};

// Enhanced parser
const parseMessage = (text: string) => {
  // Match bold (**text**) and URLs
  const boldRegex = /\*\*(.*?)\*\*/g;
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Split the text into parts to render
  const parts = text.split(/(\*\*.*?\*\*|https?:\/\/[^\s]+|\[DASHBOARD_BUTTON\])/g);

  return parts.map((part, index) => {
    if (part === "[DASHBOARD_BUTTON]") {
      return (
        <a 
          key={`dashboard-${index}`} 
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
      );
    }

    if (boldRegex.test(part)) {
      return (
        <strong key={`bold-${index}`} className="font-semibold">
          {part.replace(/\*\*/g, "")}
        </strong>
      );
    }

    if (urlRegex.test(part)) {
      const isMyBotify = part.includes("mybotify");
      const url = isMyBotify ? "https://mybotify.com/signup" : part;
      const label = isMyBotify ? "Sign up" : "Click";

      return (
        <a
          key={`url-${index}`}
          href={url}
          rel="noopener noreferrer"
          className="inline-block mt-2"
        >
          <Button className="text-sm px-4 py-1 rounded-full">{label}</Button>
        </a>
      );
    }

    return <span key={`text-${index}`}>{part}</span>;
  });
};

const ChatMessages = ({ messages }: Props) => (
  <div className="flex-1 p-4 space-y-4 flex flex-col-reverse items-center h-[60vh] overflow-y-auto no-scrollbar whitespace-pre-line">
    {messages.map((msg, index) => (
      <div
        key={index}
        className={`p-2 rounded-lg max-w-[70%] my-4 ${
          msg.isUser ? "ml-auto text-right" : "mr-auto bg-[#CAF389]"
        } break-words whitespace-pre-line animate-fade`}
      >
        {msg.text === "Loading..." ? (
          <div className="flex space-x-1 justify-start items-center">
            <div className="w-1.5 h-1.5 bg-gray-700 rounded-full animate-bounce [animation-delay:0s]" />
            <div className="w-1.5 h-1.5 bg-gray-700 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 bg-gray-700 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        ) : (
          parseMessage(msg.text)
        )}
      </div>
    ))}
  </div>
);

export default ChatMessages;
