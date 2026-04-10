/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Input } from "@/components/ui/input";
import { SetStateAction, useState, useEffect } from "react";
import { FaSearch, FaFacebook, FaInstagram } from "react-icons/fa";
import { SiGoogleads } from "react-icons/si";
import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import { IoSettings } from "react-icons/io5";
import { getStoreCampaigns } from "@/api/campaign";
import { getStoreAnalytics } from "@/api/store";

type AddAccountProps = {
  onClickTab: (tab: string) => void;
  onClickInfo: (info: string) => void;
  domain: string;
  name: string;
  storeId?: number | null;
};

type CampaignRow = {
  id: number;
  name: string;
  platform: string;
  status: string;
  budget: number;
  spent: number;
  revenue: number;
  clicks: number;
  target_audience: string;
};

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "Facebook":
      return <FaFacebook className="text-[#1877F2]" />;
    case "Instagram":
      return <FaInstagram className="text-[#E4405F]" />;
    case "Google Ads":
      return <SiGoogleads className="text-green-600" />;
    default:
      return null;
  }
};

export default function DomainInfo({
  onClickTab,
  onClickInfo,
  domain,
  name,
  storeId,
}: AddAccountProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!storeId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [campaignData, analyticsData] = await Promise.all([
          getStoreCampaigns(storeId),
          getStoreAnalytics(storeId).catch(() => null),
        ]);
        setCampaigns(
          (campaignData || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            platform: c.platform,
            status: c.status,
            budget: c.budget || 0,
            spent: c.spent || 0,
            revenue: c.revenue || 0,
            clicks: c.clicks || 0,
            target_audience: c.target_audience || "—",
          }))
        );
        setAnalytics(analyticsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [storeId]);

  const filteredCampaigns = campaigns.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rowsPerPage = 7;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredCampaigns.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (page: SetStateAction<number>) => {
    if (typeof page === "number" && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Compute totals
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const budgetPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#2e3e48]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header with Active Badge */}
      <div className="w-full flex flex-row justify-between items-center px-2">
        <button
          onClick={() => onClickInfo("")}
          className="text-sm text-[#2e3e48] hover:underline cursor-pointer"
        >
          ← Back to Domains
        </button>
        <button
          onClick={() => onClickTab("add")}
          className="flex flex-row bg-[#8FFF5C] px-3 py-2 text-[#2E3E48] font-sans font-semibold rounded-3xl text-sm"
        >
          Active
        </button>
      </div>

      {/* Domain Details */}
      <div>
        <h1 className="text-[#2e3e48] font-sans font-bold px-2">Domain Info</h1>
      </div>
      <div>
        <h1 className="text-[#2e3e48] text-xl font-sans font-bold pt-2 px-2">
          {domain}
        </h1>
      </div>

      {/* Search Bar */}
      <div className="w-full flex flex-row justify-end py-4 px-2">
        <div className="relative w-[20%]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <FaSearch />
          </div>
          <Input
            className="w-full pl-10 bg-white outline-none border-2 border-gray-200 rounded-md text-sm"
            placeholder="Search campaigns"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Content (Scrollable) */}
      <div className="flex-grow overflow-y-auto">
        {/* Table Header */}
        <div className="pb-4">
          <div className="bg-[#caf389] w-full h-10 flex flex-row items-center ">
            <div className="w-[25%] px-4  truncate">
              <h1 className="text-[#2e3e48] font-sans font-bold text-xs ">
                Campaign
              </h1>
            </div>
            <div className="w-[15%] px-4  truncate ">
              <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                Status
              </h1>
            </div>

            <div className="w-[10%] px-4  truncate flex flex-row justify-center">
              <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                Clicks
              </h1>
            </div>
            <div className="w-[10%] px-4  truncate flex flex-row justify-center">
              <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                Revenue
              </h1>
            </div>
            <div className="w-[10%] px-4  truncate flex flex-row justify-center">
              <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                Audience
              </h1>
            </div>
            <div className="w-[10%] px-4  truncate flex flex-row justify-center">
              <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                Platform
              </h1>
            </div>
            <div className="w-[10%] px-4  truncate flex flex-row justify-center">
              <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                Budget Spend
              </h1>
            </div>
            <div className="w-[10%] px-4  truncate flex flex-row justify-center">
              <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                Action
              </h1>
            </div>
          </div>
        </div>

        {/* Table Rows */}
        {currentRows.length > 0 ? (
          currentRows.map((campaign) => {
            const campBudgetPct = campaign.budget > 0 ? Math.round((campaign.spent / campaign.budget) * 100) : 0;
            return (
              <div key={campaign.id} className="pb-4">
                <div className="bg-white w-full h-12 flex flex-row items-center">
                  <div className="w-[25%] px-4 h-full">
                    <div className="flex flex-row items-center w-full h-full">
                      <div className="text-xl mr-2">
                        {getPlatformIcon(campaign.platform)}
                      </div>
                      <div className="px-2">
                        <h1 className="text-[#2e3e48] font-sans text-xs font-medium cursor-pointer truncate">
                          {campaign.name}
                        </h1>
                        <h1 className="text-[#2e3e48] font-sans text-xs font-medium cursor-pointer">
                          {campaign.platform}
                        </h1>
                      </div>
                    </div>
                  </div>
                  <div className="w-[15%] px-4 truncate ">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                      campaign.status === "Active"
                        ? "bg-[#8FFF5C] text-[#162120]"
                        : "bg-[#E5E5E5] text-[#162120]"
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="w-[10%] px-4  truncate flex flex-col justify-center items-center">
                    <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                      {campaign.clicks}
                    </h1>
                  </div>
                  <div className="w-[10%] px-4  truncate flex flex-col justify-center items-center">
                    <h1 className="text-[#2e3e48] font-sans font-bold text-xs">
                      ${campaign.revenue.toFixed(0)}
                    </h1>
                  </div>
                  <div className="w-[10%] px-4  truncate flex flex-col justify-center items-center">
                    <h1 className="text-[#2e3e48] font-sans text-xs font-medium truncate" title={campaign.target_audience}>
                      {campaign.target_audience}
                    </h1>
                  </div>
                  <div className="w-[10%] px-4 truncate flex flex-col justify-center items-center">
                    <h1 className="text-[#2e3e48] font-sans text-xs font-medium">
                      {campaign.platform}
                    </h1>
                  </div>
                  <div className="w-[10%]  flex flex-row item-center justify-center">
                    <AnimatedCircularProgressBar
                      max={100}
                      min={0}
                      value={campBudgetPct}
                      gaugePrimaryColor="rgb(202 243 137)"
                      gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                      className=" w-[40%]"
                    />
                  </div>
                  <div className="w-[10%] flex flex-row item-center justify-center">
                    <div className="text-[#2e3e48] font-sans font-bold text-xs">
                      <IoSettings />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-4 text-center text-sm text-[#2E3E48]">
            {campaigns.length === 0
              ? "No campaigns found for this store."
              : "No matching campaigns"}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center py-4 px-2">
        <div className=" text-sm font-sans text-[#2e3e48]">
          Showing {currentRows.length} of {filteredCampaigns.length} rows
        </div>
        <div className="flex items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-white bg-[#2e3e48] rounded-md"
          >
            <GrFormPrevious />
          </button>
          <span className="px-2 text-sm font-sans text-[#2e3e48]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-white bg-[#2e3e48] rounded-md"
          >
            <GrFormNext />
          </button>
        </div>
      </div>
    </div>
  );
}
