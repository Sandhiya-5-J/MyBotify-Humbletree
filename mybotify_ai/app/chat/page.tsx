/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { sendMessageToBot } from "@/api/chat";
import { isAuthenticated, setToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import ChatMessages from "@/components/chat/chatMessage";
import ChatInput from "@/components/chat/chatInput";
import MainFooter from "@/components/common/main_footer";
import LoginPopup from "@/components/home/login_popup";

const ChatPage = () => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>(
    []
  );
 // Store conversationId in state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);

 
  useEffect(() => {
    const handleBeforeUnload = () => {
   Cookies.remove('conversation_id');
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    setIsLoggedIn(isAuthenticated());

    const queryMessage = new URLSearchParams(window.location.search).get(
      "message"
    );

    if (queryMessage) {
      try {
        const parsedMessage = JSON.parse(decodeURIComponent(queryMessage));
        handleSendMessage(parsedMessage.text);
         router.replace("/chat");
       
      } catch (error) {
        console.error("Error parsing query message:", error);
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

   const setCookies = async (cookies?:any) =>{
    
    if (!Cookies.get("conversation_id") && cookies && Array.isArray(cookies)) {
      const conversationCookie = cookies.find(cookie =>
        cookie.startsWith("conversation_id=")
      );

      if (conversationCookie) {
        const cookieValue = conversationCookie.split(";")[0]; // e.g. 'conversation_id=abc-uuid'
        const [cookieName, cookieVal] = cookieValue.split("=");

       Cookies.set(cookieName, cookieVal);

      }}
  }

  const handleSendMessage = async (text?: string) => {
    const userText = text || message.trim();
    if (!userText) return;

    if (!text) setMessage(""); // Clear only if typed manually

    setMessages((prev) => [{ text: userText, isUser: true }, ...prev]);
    setMessages((prev) => [{ text: "Loading...", isUser: false }, ...prev]);

    try {
      const conversationId = Cookies.get("conversation_id");
     
      const response = await sendMessageToBot(userText,conversationId ?? "");

      let botResponse = response?.message || "No response";

      if (botResponse.includes("Access token: ")) {
        const tokenSplit = botResponse.split("Access token: ");
        const token = tokenSplit[1]?.replace("✅", "")?.trim(); // Ensure no trailing emojis or spaces
        if (token) {
          setToken(token);
          setIsLoggedIn(true);
        }
        botResponse = tokenSplit[0].trim() + " [DASHBOARD_BUTTON]";
      }

         setCookies(response?.cookies);
      setMessages((prev) => [
        { text: botResponse, isUser: false },
        ...prev.filter((msg) => msg.text !== "Loading..."),
      ]);
    } catch (error) {
      setMessages((prev) => [
        { text: "Please try again.", isUser: false },
        ...prev.filter((msg) => msg.text !== "Loading..."),
      ]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F2]">
      {/* Header */}
      <div className="flex items-center justify-between px-20 pt-8">
        <h1
          onClick={() => router.back()}
          className="text-2xl font-bold text-[#2E3E48] font-sans cursor-pointer"
        >
          MyBotify<span className="font-normal">.com</span>
        </h1>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-[#2E3E48]"
          >
            back
          </Button>
          {isLoggedIn ? (
            <Button
              onClick={() => router.push("/profile")}
              className="bg-[#162120] text-white rounded-3xl"
            >
              Profile
            </Button>
          ) : (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#162120] text-white rounded-3xl"
            >
              Log in
            </Button>
          )}
        </div>
      </div>

      {/* Chat Body */}
      <div className="absolute bottom-20 left-1/2 w-1/2 transform -translate-x-1/2">
        <div ref={messagesEndRef}>
          <ChatMessages messages={messages} />
        </div>
        <ChatInput
          message={message}
          setMessage={setMessage}
          onSend={() => handleSendMessage()}
        />
      </div>

      <MainFooter />

      <LoginPopup
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isSignUp={true}
      />
    </div>
  );
};

export default ChatPage;
