"use client";

import { useEffect, useState } from "react";

import HeaderWithPopovers from "../../common/header";
import Footer from "../../common/footer";
import SideBar from "../common/side_bar";
import DomainInfo from "../info/domain_info";
import ContentDomain from "./content";

export default function Domain() {
  const [activeTab, setActiveTab] = useState("domain");
  const [domain, setDomain] = useState("");
  const [activeInfo, setActiveInfo] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [addAccount, setAccount] = useState("No");

  const handleAccount = (account: string) => {
    if (account === "add") {
      setAccount(addAccount === "add" ? "render" : "add");
    } else {
      setAccount("No");
    }
  };

  const handleClickInfo = (info: string, domainName: string, storeId?: number) => {
    setActiveInfo(info);
    setDomain(domainName);
    if (storeId) {
      setSelectedStoreId(storeId);
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
      <div className="flex h-[90%]">
        <div className="w-[14%] h-full">
          <SideBar
            activeTab={activeTab}
            onClickTab={setActiveTab}
            activeInfo={activeInfo}
            onClickInfo={setActiveInfo}
          />
        </div>
        <div className="w-[61%] h-full flex flex-col items-center py-4 border-r-2 border-gray-300 ">
          {activeTab === "domain" && activeInfo === "" && (
            <ContentDomain
              onClickTab={(account: string) => {
                handleAccount(account);
              }}
              onClickInfo={handleClickInfo}
              domain={domain}
            />
          )}

          {activeTab === "domain" && activeInfo === "info" && (
            <DomainInfo
              onClickTab={(account: string) => {
                handleAccount(account);
              }}
              onClickInfo={setActiveInfo}
              domain={domain}
              name={activeInfo}
              storeId={selectedStoreId}
            />
          )}
          <Footer />
        </div>
      </div>
    </div>
  );
}
