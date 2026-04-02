"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SideBar from "@/components/account/common/side_bar";
import ChatBar from "@/components/account/common/chat_bar";
import HeaderWithPopovers from "../../common/header";
import ContentAccount from "@/components/account/account_tab/content";

import Footer from "../../common/footer";
import { isAuthenticated } from "@/lib/auth";

export default function AccountHome() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("account");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  if (!authChecked) {
    return (
      <div className="w-full h-full bg-[#F1F5F2] flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#F1F5F2]">
      <HeaderWithPopovers />
      <div className="flex h-[90%]">
        <div className="w-[14%] h-full">
          <SideBar activeTab={activeTab} onClickTab={setActiveTab} />
        </div>

        <div className="w-[61%] h-full flex flex-col items-center py-4 border-r-2 border-gray-300 ">
          <ContentAccount />
          <Footer />
        </div>
        <ChatBar addAccountChat={""} />
      </div>
    </div>
  );
}
