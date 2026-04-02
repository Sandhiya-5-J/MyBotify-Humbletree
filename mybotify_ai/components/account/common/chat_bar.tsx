/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Cookies from "js-cookie";
import { sendMessageToBot } from "@/api/chat";

type ChatBarProps = {
  addAccountChat: string;
  storeId?: number;
  isAdminChat?: boolean;
};

const ChatBar = ({ addAccountChat, storeId, isAdminChat }: ChatBarProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>(
    []
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initialMessages = useMemo(
    () => [
      { text: "Add Account", isUser: true },
      { text: "Hi There, am assist to Add account !", isUser: false },
      { text: "Enter your Add Account Email ID", isUser: false },
    ],
    []
  );
  const addAccountChatRef = useRef(addAccountChat);

  useEffect(() => {
    addAccountChatRef.current = addAccountChat;
    if (
      addAccountChatRef.current === "add" ||
      addAccountChatRef.current === "render"
    ) {
      const timeoutIds: NodeJS.Timeout[] = [];
      initialMessages.forEach((message, index) => {
        const timeoutId = setTimeout(() => {
          setMessages((prev) => [message, ...prev]);
        }, (index + 1) * 1000);
        timeoutIds.push(timeoutId);
      });

      return () => {
        addAccountChatRef.current = "No";
        timeoutIds.forEach(clearTimeout);
      };
    }
  }, [addAccountChat, initialMessages]);

  const setCookies = async (cookies?: any) => {
    if (!Cookies.get("conversation_id") && cookies && Array.isArray(cookies)) {
      const conversationCookie = cookies.find((cookie: string) =>
        cookie.startsWith("conversation_id=")
      );
      if (conversationCookie) {
        const cookieValue = conversationCookie.split(";")[0];
        const [cookieName, cookieVal] = cookieValue.split("=");
        Cookies.set(cookieName, cookieVal);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userText = message.trim();
    setMessages((prevMessages) => [
      { text: userText, isUser: true },
      ...prevMessages,
    ]);
    setMessage("");

    setIsLoading(true);
    setMessages((prev) => [{ text: "Loading...", isUser: false }, ...prev]);

    try {
      const conversationId = Cookies.get("conversation_id");
      const response = await sendMessageToBot(userText, conversationId ?? "", storeId, isAdminChat);

      const botResponse = response?.message || "No response";
      setCookies(response?.cookies);

      setMessages((prev) => [
        { text: botResponse, isUser: false },
        ...prev.filter((msg) => msg.text !== "Loading..."),
      ]);
    } catch (error) {
      setMessages((prev) => [
        { text: "Something went wrong. Please try again.", isUser: false },
        ...prev.filter((msg) => msg.text !== "Loading..."),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" w-[25%] flex flex-col justify-between flex-grow-0">
      <div className="h-[14%] flex flex-row justify-between w-full">
        <div className="flex flex-row items-center px-4 text-lg text-[#162120] font-sans font-semibold">
          Let`s Chat with me !
        </div>
        <div className=" w-40 h-full">
          <Image
            src="/logo_sm.svg"
            alt="Mybotify logo"
            width={200}
            height={200}
          />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4 flex flex-col-reverse items-center h-[60vh] resize-none overflow-y-auto no-scrollbar">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg max-w-[50%] text-[#162120] my-2 ${msg.isUser ? "ml-auto" : "bg-[#CAF389]  mr-auto"
              } break-words animate-fade`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>
      <div className="h-48 px-4">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className="resize-none bg-white h-32  no-scrollbar p-4 caret-[#162120] focus-visible:ring-gray-300  font-sans text-sm w-full rounded-2xl"
          placeholder="feel free to ask me..."
        />
        <div className="flex justify-end p-2">
          <Button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="text-white bg-[#2E3E48] border-none rounded-3xl px-4 py-2 font-sans font-medium cursor-pointer"
          >
            {isLoading ? "Sending..." : "Start"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBar;
