"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiOutlineGlobal } from "react-icons/ai";
import { FaChartSimple, FaCartShopping } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { Button } from "../ui/button";
import LoginPopup from "./login_popup";
import MainFooter from "../common/main_footer";
import MainHeader from "../common/main_header";
import { isAuthenticated, getUserRole } from "@/lib/auth";
const suggestions = [
  {
    id: 1,
    title: "How can I increase the traffic to my Shopify store?",
    icon: <AiOutlineGlobal />,
  },
  {
    id: 2,
    title: "Can you recommend the best campaign strategy for my product?",
    icon: <FaChartSimple />,
  },
  {
    id: 3,
    title: "Which platform should I prioritize for my apparel campaigns?",
    icon: <IoMdSettings />,
  },
  {
    id: 4,
    title:
      "What are the top products or trends in the apparel industry right now?",
    icon: <FaCartShopping />,
  },
];

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
 
  const handleSendMessage = useCallback(() => {
    if (!message.trim()) return;

    const lowerMessage = message.trim().toLowerCase();
    if (lowerMessage === "go to dashboard" || lowerMessage === "open dashboard" || lowerMessage === "dashboard") {
      if (isAuthenticated()) {
        const role = getUserRole();
        if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/account");
        }
      } else {
        setIsModalOpen(true);
      }
      return;
    }

    const formattedMessage = {
      text: message.trim(),
      isUser: true,
    };
    router.push(
      `/chat?message=${encodeURIComponent(JSON.stringify(formattedMessage))}`
    );
  }, [message, router]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (title: string) => {
    const message = {
      text: title,
      isUser: true,
    };
    router.push(`/chat?message=${encodeURIComponent(JSON.stringify(message))}`);
  };



  return (
    <div className="flex flex-col min-h-screen bg-[#F1F5F2]">
      <MainHeader 
        onLoginClick={() => setIsModalOpen(true)}
        />
      
      <div className="flex flex-1">
        <div className="w-3/4 ">
          <div className=" pt-8 px-20">
            <h1 className="text-4xl text-[#2E3E48] font-light font-sans">
              Empower Your{" "}
              <span className="text-[#162120] font-medium font-sans">
                Shopify
              </span>{" "}
              Store With AI
            </h1>
            <h1 className="text-[#2E3E48] pt-4 text-lg font-light font-sans">
              Leverage AI to analyze customer behavior and maximize your <br />{" "}
              campaign performance across multiple platforms.{" "}
            </h1>
            <h1 className="text-lg text-[#2E3E48] font-bold font-sans pt-6">
              Hi there,
            </h1>
            <h1 className="text-[#2E3E48] pt-2 text-lg font-light font-sans">
              I can assist you in optimizing your marketing campaigns!
            </h1>
            <div className="h-50  mt-10 rounded-2xl flex flex-col bg-white p-2 relative border-grey-500 border-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 outline-none resize-none caret-[#162120] border-sizing border-[#162120]
                rounded-2xl overflow-y-auto p-4 line-height-[1.5] font-sans text-lg no-scrollbar "
                placeholder="feel free to ask me....."
              ></textarea>

              <div className="flex justify-end px-4 py-0 align-middle">
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="text-white bg-[#2E3E48] border-none rounded-3xl px-4 py-2 font-sans font-medium cursor-pointer"
                >
                  Start
                </Button>
              </div>
            </div>
          </div>
          <h3 className="text-[#16120] pt-8 text-xl font-normal font-sans px-20">
            Our suggestion prompt
          </h3>
        </div>
        {/* Logo Section */}
        <div className="w-1/2 pt-20">
          <Image
            src="/logo.svg"
            alt="Mybotify logo"
            className="max-w-full max-h-full object-contain"
            width={500}
            height={500}
          />
        </div>
      </div>
      {/* Suggestions */}
      <div className="w-full flex gap-6 px-20  pb-24  justify-center items-center">
        {suggestions.map((item) => (
          <div
            key={item.id}
            onClick={() => handleSuggestionClick(item.title)}
            className="w-1/4 bg-[#F4F4F4] py-4 px-2 rounded-2xl shadow-lg shadow-[#C0C0C0] relative cursor-pointer border border-[#C0C0C0]"
          >
            <div className="absolute top-2 left-2 bg-[#CAF389] p-1.5 rounded-lg">
              <span className="text-black text-lg">{item.icon}</span>{" "}
            </div>
            <div className="mt-10">
              <p className="text-black text-sm justify-start">{item.title}</p>
            </div>
          </div>
        ))}
      </div>
      {/* footer */}
      <MainFooter />
      <LoginPopup
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isSignUp={true}
      />
    </div>
  );
}
