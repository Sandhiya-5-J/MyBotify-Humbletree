"use client";

import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaRegBuilding } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { SiGoogleads } from "react-icons/si";

import { FaMoneyCheck } from "react-icons/fa6";
import { getMyStores } from "@/api/store";
import { getStoreCampaigns } from "@/api/campaign";
import AddCampaignModal from "./add_campaign_modal";

export default function ContentCampaign() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  const fetchStoresAndCampaigns = async () => {
    setLoading(true);
    try {
      const myStores = await getMyStores();
      if (myStores) {
        const storesWithCampaigns = await Promise.all(
          myStores.map(async (store: any) => {
            const campaigns = await getStoreCampaigns(store.id);
            return {
              ...store,
              campaigns: campaigns || [],
            };
          })
        );
        setStores(storesWithCampaigns);
        if (storesWithCampaigns.length > 0) {
          setSelectedStoreId(storesWithCampaigns[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoresAndCampaigns();
  }, []);

  const handleOpenModal = () => {
    if (!selectedStoreId && stores.length > 0) {
      setSelectedStoreId(stores[0].id);
    }
    if (selectedStoreId || stores.length > 0) {
      setIsModalOpen(true);
    } else {
      alert("Please connect a store first from the Account page.");
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Facebook":
        return <FaFacebook className="text-blue-600" />;
      case "Instagram":
        return <FaInstagram className="text-pink-600" />;
      case "Google Ads":
        return <SiGoogleads className="text-yellow-500" />;
      default:
        return <MdAdd />;
    }
  };

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

  // Calculate totals for currently selected store or all stores combined
  let totalRevenue = 0;
  let totalCampaigns = 0;
  stores.forEach((store) => {
    store.campaigns.forEach((c: any) => {
      totalRevenue += c.revenue || 0;
      totalCampaigns++;
    });
  });

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto">
      {/* Header with Add Account Button */}
      <div className="w-full flex flex-row justify-end items-center px-4 py-2">
        <button
          onClick={handleOpenModal}
          className="flex flex-row items-center bg-[#2e3e48] hover:bg-[#1a2329] transition-colors px-4 py-2 text-white font-sans font-semibold rounded-3xl text-sm"
        >
          <MdAdd className="mr-2 text-lg" />
          Add Campaign
        </button>
      </div>
      {/* Account Details */}
      <div className="px-4">
        <h1 className="text-[#2e3e48] text-2xl font-sans font-bold">
          My Campaigns
        </h1>
        <h1 className="text-[#2e3e48] text-sm font-sans font-bold pt-2">
          Overall revenue
        </h1>
        <h1 className="text-[#2e3e48] text-xl font-sans font-bold pt-1">
          ${totalRevenue.toFixed(2)}
        </h1>
      </div>

      <div className="flex-grow pt-4">
        <div className="flex flex-row justify-between items-center p-4 gap-4">
          <div className="bg-white p-4 flex-1 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-gray-600">Total Campaigns</div>
                <div className="text-2xl font-bold text-[#2e3e48]">{totalCampaigns}</div>
              </div>
              <div className="bg-[#caf389] h-10 w-10 flex justify-center items-center rounded-lg">
                <FaRegBuilding className="text-[#2e3e48] text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 flex-1 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-gray-600">Generated Ad Copy</div>
                <div className="text-2xl font-bold text-[#2e3e48]">{totalCampaigns}</div>
              </div>
              <div className="bg-[#caf389] h-10 w-10 flex justify-center items-center rounded-lg">
                <FaMoneyCheck className="text-[#2e3e48] text-xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {stores.length === 0 && (
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">No stores connected. Please connect a Shopify store first.</p>
            </div>
          )}
          
          {stores.map((store) => (
            <div key={store.id} className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h2 className="text-xl font-bold text-[#2e3e48]">{store.store_name}</h2>
                <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Active
                </span>
              </div>
              
              {store.campaigns.length === 0 ? (
                <p className="text-sm text-gray-500 italic py-2">No campaigns created yet.</p>
              ) : (
                <div className="space-y-3">
                  {store.campaigns.map((campaign: any) => (
                    <div key={campaign.id} className="flex flex-col p-3 bg-gray-50 rounded border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(campaign.platform)}
                          <span className="font-semibold">{campaign.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          campaign.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                        <div><span className="font-semibold text-gray-800">Budget:</span> ${campaign.budget}</div>
                        <div><span className="font-semibold text-gray-800">Target:</span> {campaign.target_audience}</div>
                      </div>
                      
                      {campaign.generated_copy && (
                        <div className="mt-3 text-sm bg-white p-2 rounded border border-gray-200 text-gray-700">
                          <div className="text-xs font-semibold text-gray-500 mb-1">Ad Copy:</div>
                          <p className="italic">"{campaign.generated_copy}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && selectedStoreId && (
        <AddCampaignModal
          storeId={selectedStoreId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchStoresAndCampaigns();
          }}
        />
      )}
    </div>
  );
}
