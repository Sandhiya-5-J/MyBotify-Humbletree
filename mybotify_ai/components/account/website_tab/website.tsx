/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import SideBar from "@/components/account/common/side_bar";
import ChatBar from "@/components/account/common/chat_bar";
import HeaderWithPopovers from "../../common/header";
import Footer from "../../common/footer";
import ContentWebsite from "./content";

export default function Website() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("website");
  const [addAccount, setAccount] = useState("No");
  const handleAccount = (account: string) => {
    if (account === "add") {
      setAccount(addAccount === "add" ? "render" : "add");
    } else {
      setAccount("No");
    }
  };
  const clickDomain = () => {
    router.push("/domain");
  };
  return (
    <div className="w-full h-full bg-[#F1F5F2]">
      <HeaderWithPopovers />
      <div className="flex h-[90%]">
        <div className="w-[14%] h-full">
          <SideBar activeTab={activeTab} onClickTab={setActiveTab} />
        </div>
        <div className="w-[61%] h-full flex flex-col items-center py-4 border-r-2 border-gray-300 ">
          <ContentWebsite
            onClickTab={(account: string) => {
              handleAccount(account);
            }}
          />
          <Footer />
        </div>
        <ChatBar addAccountChat={addAccount} />
      </div>
    </div>
  );
}
