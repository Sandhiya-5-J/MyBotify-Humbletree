/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Input } from "@/components/ui/input";
import { SetStateAction, useState, useEffect, JSX } from "react";
import { FaSearch, FaFacebook, FaInstagram } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { SiGoogleads } from "react-icons/si";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import { getMyStores } from "@/api/store";
import { getStoreCampaigns } from "@/api/campaign";
import toast from "react-hot-toast";

type AddAccountProps = {
  onClickTab: (tab: string) => void;
  onClickInfo: (info: string, domainName: string, storeId?: number) => void;
  domain: string;
};

type Campaign = {
  id: number;
  name: string;
  platform: string;
  status: string;
};

type StoreWithCampaigns = {
  id: number;
  store_name: string;
  store_url: string;
  is_active: boolean;
  campaigns: Campaign[];
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

export default function ContentDomain({
  onClickTab,
  onClickInfo,
  domain,
}: AddAccountProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [stores, setStores] = useState<StoreWithCampaigns[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const myStores = await getMyStores();
        if (myStores) {
          const storesWithCampaigns = await Promise.all(
            myStores.map(async (store: any) => {
              const campaigns = await getStoreCampaigns(store.id);
              return {
                id: store.id,
                store_name: store.store_name,
                store_url: store.store_url || store.store_name,
                is_active: store.is_active,
                campaigns: (campaigns || []).map((c: any) => ({
                  id: c.id,
                  name: c.name,
                  platform: c.platform,
                  status: c.status,
                })),
              };
            })
          );
          setStores(storesWithCampaigns);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load stores");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStores = stores.filter((s) =>
    (s.store_url || s.store_name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rowsPerPage = 7;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(filteredStores.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredStores.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (page: SetStateAction<number>) => {
    if (typeof page === "number" && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
      {/* Header with Add Account Button */}
      <div className="w-full flex flex-row justify-end items-center px-2">
        <button
          onClick={() => onClickTab("add")}
          className="flex flex-row bg-[#2e3e48] px-3 py-2 text-white font-sans font-semibold rounded-3xl text-sm"
        >
          <div className="pr-2 pt-0.5 font-bold">
            <MdAdd />
          </div>
          Add Domain
        </button>
      </div>

      {/* Account Details */}
      <div>
        <h1 className="text-[#2e3e48] font-sans font-bold px-2">
          Account Domain Details
        </h1>
      </div>
      <div>
        <h1 className="text-[#2e3e48] text-xl font-sans font-bold pt-2 px-2">
          {domain || "My Stores"}
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
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Content (Scrollable) */}
      <div className="flex-grow overflow-y-auto">
        {/* Table Header */}
        <div className="pb-4">
          <div className="bg-[#caf389] w-full h-10 flex flex-row items-center">
            <div className="w-1/3 px-4">
              <h1 className="text-[#2e3e48] font-sans font-bold text-sm">
                Domain Info
              </h1>
            </div>
            <div className="w-1/3 px-4 text-center">
              <h1 className="text-[#2e3e48] font-sans font-bold text-sm">
                Domain Status
              </h1>
            </div>
            <div className="w-1/2 px-4 text-start">
              <h1 className="text-[#2e3e48] font-sans font-bold text-sm">
                Campaign
              </h1>
            </div>
          </div>
        </div>

        {/* Table Rows */}
        {currentRows.length > 0 ? (
          currentRows.map((store) => (
              <div key={store.id} className="pb-4">
              <div className="bg-white w-full h-10 flex flex-row items-center hover:bg-gray-50 transition-colors rounded">
                {/* Domain Info */}
                <div className="w-1/3 px-4 truncate">
                  <h1
                    onClick={() => onClickInfo("info", store.store_url || store.store_name, store.id)}
                    className="text-[#2e3e48] font-sans text-sm font-medium cursor-pointer hover:underline"
                    title={store.store_url || store.store_name}
                  >
                    {store.store_url || store.store_name}
                  </h1>
                </div>

                {/* Status */}
                <div className="w-1/3 px-4 flex justify-center items-center">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-lg text-[#162120] ${
                      store.is_active
                        ? "bg-[#8FFF5C] "
                        : "bg-[#E5E5E5] "
                    }`}
                  >
                    {store.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Campaigns */}
                <div className="w-1/2 px-4 text-right flex flex-row gap-4 justify-start items-center">
                  {store.campaigns.length > 0 ? (
                    store.campaigns.map((campaign) => (
                      <span
                        key={campaign.id}
                        className={`px-2 py-1 gap-1 flex flex-row justify-center items-center text-xs font-medium rounded-2xl ${
                          campaign.status === "Active"
                            ? "bg-white border-2 border-gray-200"
                            : "bg-[#E5E5E5]"
                        }`}
                      >
                        <div className="text-sm">
                          {getPlatformIcon(campaign.platform)}
                        </div>
                        {campaign.platform}
                      </span>
                    ))
                  ) : (
                    <div className="text-xs text-[#888686]">
                      No Campaign found
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-sm text-[#2E3E48]">
            {stores.length === 0
              ? "No stores connected. Please connect a store first."
              : "No Domain found"}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center py-4 px-2">
        <div className=" text-sm font-sans text-[#2e3e48]">
          Showing {currentRows.length} of {filteredStores.length} rows
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
