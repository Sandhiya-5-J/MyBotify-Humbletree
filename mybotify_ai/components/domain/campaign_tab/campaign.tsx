/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";

import HeaderWithPopovers from "../../common/header";
import Footer from "../../common/footer";
import SideBar from "../common/side_bar";

import ContentCampaign from "./content";

export default function Campaign() {
  const [activeTab, setActiveTab] = useState("campaign");
  const [domain, setDomain] = useState("");
  const [activeInfo, setActiveInfo] = useState("");
  const [addAccount, setAccount] = useState("No");
  const handleAccount = (account: string) => {
    if (account === "add") {
      setAccount(addAccount === "add" ? "render" : "add");
    } else {
      setAccount("No");
    }
  };

  useEffect(() => {
    const queryMessage = new URLSearchParams(window.location.search).get(
      "domain"
    );
    let parsedMessage;
    if (queryMessage) {
      parsedMessage = JSON.parse(decodeURIComponent(queryMessage));
      setDomain(parsedMessage);
    }
  }, []);

  return (
    <div className="w-full h-full bg-[#F1F5F2]">
      <HeaderWithPopovers />
      <div className="flex h-[90%] flex-col md:flex-row">
        <div className="hidden md:block md:w-[14%] h-full">
          <SideBar
            activeTab={activeTab}
            onClickTab={setActiveTab}
            activeInfo={activeInfo}
            onClickInfo={setActiveInfo}
          />
        </div>
        <div className="w-full md:w-[61%] h-full flex flex-col items-center py-4 border-r-2 border-gray-300 ">
          {activeTab === "campaign" && activeInfo === "" && <ContentCampaign />}

          <Footer />
        </div>
      </div>
    </div>
  );
}
