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
import { FaRobot } from "react-icons/fa";
import { MdTrendingUp, MdCampaign, MdStorefront, MdAutoAwesome } from "react-icons/md";

const SUGGESTION_CHIPS = [
  {
    icon: <MdTrendingUp className="text-lg" />,
    text: "How can I increase the traffic to my Shopify store?",
    color: "from-emerald-50 to-green-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: <MdCampaign className="text-lg" />,
    text: "Can you recommend the best campaign strategy for my product?",
    color: "from-blue-50 to-indigo-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    icon: <MdStorefront className="text-lg" />,
    text: "Which platform should I prioritize for my campaigns?",
    color: "from-amber-50 to-orange-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100 text-amber-600",
  },
  {
    icon: <MdAutoAwesome className="text-lg" />,
    text: "What are the top trends in the apparel industry right now?",
    color: "from-purple-50 to-pink-50",
    border: "border-purple-200",
    iconBg: "bg-purple-100 text-purple-600",
  },
];

const ChatPage = () => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = () => {
      Cookies.remove("conversation_id");
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

  const handleSendMessage = async (text?: string) => {
    const userText = text || message.trim();
    if (!userText) return;

    if (!text) setMessage("");
    setShowWelcome(false);

    setMessages((prev) => [{ text: userText, isUser: true }, ...prev]);
    setMessages((prev) => [{ text: "Loading...", isUser: false }, ...prev]);

    try {
      const conversationId = Cookies.get("conversation_id");

      const response = await sendMessageToBot(
        userText,
        conversationId ?? ""
      );

      let botResponse = response?.message || "No response";

      if (botResponse.includes("Access token: ")) {
        const tokenSplit = botResponse.split("Access token: ");
        const token = tokenSplit[1]?.replace("✅", "")?.trim();
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F1F5F2] via-[#EDF3F8] to-[#E8F0F7]">
      {/* Header */}
      <div className="flex items-center justify-between px-8 md:px-20 pt-6 pb-2">
        <h1
          onClick={() => router.push("/")}
          className="text-2xl font-bold text-[#2E3E48] font-sans cursor-pointer hover:opacity-80 transition-opacity"
        >
          MyBotify<span className="font-normal">.com</span>
        </h1>
        <div className="flex gap-3 items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-[#2E3E48] hover:bg-[#2e3e48]/5"
          >
            ← Back
          </Button>
          {isLoggedIn ? (
            <Button
              onClick={() => router.push("/profile")}
              className="bg-[#2e3e48] text-white rounded-full px-5 hover:bg-[#1a2830] transition-colors"
            >
              Profile
            </Button>
          ) : (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#2e3e48] text-white rounded-full px-5 hover:bg-[#1a2830] transition-colors"
            >
              Log in
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-end px-4 pb-4">
        {/* Welcome Section — shown only when no messages */}
        {showWelcome && messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto animate-fade">
            {/* Bot Avatar */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#CAF389] to-[#8ED65C] flex items-center justify-center shadow-lg">
                <FaRobot className="text-3xl text-[#2e3e48]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-white" />
            </div>

            {/* Welcome Text */}
            <h2 className="text-3xl font-bold text-[#2E3E48] mb-2 text-center">
              Hi there! 👋
            </h2>
            <p className="text-gray-500 text-center text-base mb-8 max-w-md">
              I&apos;m your AI marketing assistant. Ask me anything about your Shopify
              store, campaigns, or marketing strategies.
            </p>

            {/* Suggestion Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mb-8">
              {SUGGESTION_CHIPS.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(chip.text)}
                  className={`flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br ${chip.color} border ${chip.border} text-left hover:scale-[1.02] hover:shadow-md transition-all duration-200 group`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${chip.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    {chip.icon}
                  </div>
                  <span className="text-sm text-[#2e3e48] font-medium leading-snug">
                    {chip.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages Area */}
        {(!showWelcome || messages.length > 0) && (
          <div className="w-full max-w-2xl flex-1 mb-4">
            <div ref={messagesEndRef}>
              <ChatMessages messages={messages} />
            </div>
          </div>
        )}

        {/* Chat Input — always at the bottom */}
        <div className="w-full max-w-2xl">
          <ChatInput
            message={message}
            setMessage={setMessage}
            onSend={() => handleSendMessage()}
          />
          <p className="text-center text-[11px] text-gray-400 mt-2">
            Powered by AI · Your data stays private and secure
          </p>
        </div>
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
