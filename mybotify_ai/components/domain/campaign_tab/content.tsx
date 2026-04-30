"use client";

import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaRegBuilding } from "react-icons/fa";
import { MdAdd, MdDelete } from "react-icons/md";
import { SiGoogleads } from "react-icons/si";
import { FaMoneyCheck } from "react-icons/fa6";
import { IoStatsChart } from "react-icons/io5";
import { getMyStores } from "@/api/store";
import { getStoreCampaigns, deleteCampaign, updateCampaign } from "@/api/campaign";
import AddCampaignModal from "./add_campaign_modal";
import toast from "react-hot-toast";

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
      toast.error("Please connect a store first from the Account page.");
    }
  };

  const handleDelete = async (campaignId: number, campaignName: string) => {
    if (!confirm(`Are you sure you want to delete "${campaignName}"?`)) return;
    try {
      await deleteCampaign(campaignId);
      toast.success("Campaign deleted successfully");
      fetchStoresAndCampaigns();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete campaign");
    }
  };

  const handleToggleStatus = async (campaignId: number, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Paused" : "Active";
    try {
      await updateCampaign(campaignId, { status: newStatus });
      toast.success(`Campaign ${newStatus === "Active" ? "activated" : "paused"}`);
      fetchStoresAndCampaigns();
    } catch (e: any) {
      toast.error(e.message || "Failed to update campaign status");
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

  // Calculate totals across all stores
  let totalRevenue = 0;
  let totalSpent = 0;
  let totalCampaigns = 0;
  let totalClicks = 0;
  stores.forEach((store) => {
    store.campaigns.forEach((c: any) => {
      totalRevenue += c.revenue || 0;
      totalSpent += c.spent || 0;
      totalClicks += c.clicks || 0;
      totalCampaigns++;
    });
  });

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto">
      {/* Header with Add Campaign Button */}
      <div className="w-full flex flex-row justify-end items-center px-4 py-2">
        <button
          onClick={handleOpenModal}
          className="flex flex-row items-center bg-[#2e3e48] hover:bg-[#1a2329] transition-colors px-4 py-2 text-white font-sans font-semibold rounded-3xl text-sm"
        >
          <MdAdd className="mr-2 text-lg" />
          Add Campaign
        </button>
      </div>

      {/* Page Title & Revenue */}
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

      {/* Stats Cards */}
      <div className="flex-grow pt-4">
        <div className="flex flex-row justify-between items-center p-4 gap-4">
          <div className="bg-white p-4 flex-1 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
          <div className="bg-white p-4 flex-1 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-gray-600">Total Spent</div>
                <div className="text-2xl font-bold text-[#2e3e48]">${totalSpent.toFixed(2)}</div>
              </div>
              <div className="bg-[#caf389] h-10 w-10 flex justify-center items-center rounded-lg">
                <FaMoneyCheck className="text-[#2e3e48] text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 flex-1 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-gray-600">Total Clicks</div>
                <div className="text-2xl font-bold text-[#2e3e48]">{totalClicks.toLocaleString()}</div>
              </div>
              <div className="bg-[#caf389] h-10 w-10 flex justify-center items-center rounded-lg">
                <IoStatsChart className="text-[#2e3e48] text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Listings */}
        <div className="p-4">
          {stores.length === 0 && (
            <div className="text-center p-12 bg-gray-50 rounded-lg border border-gray-200">
              <FaRegBuilding className="text-gray-300 text-5xl mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">No stores connected</p>
              <p className="text-gray-400 text-sm mt-1">Please connect a Shopify store first to start creating campaigns.</p>
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
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 italic">No campaigns created yet. Click &quot;Add Campaign&quot; to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {store.campaigns.map((campaign: any) => (
                    <div key={campaign.id} className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#CAF389] hover:shadow-sm transition-all">
                      {/* Campaign Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(campaign.platform)}
                          <span className="font-semibold text-[#2e3e48]">{campaign.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Status Toggle */}
                          <button
                            onClick={() => handleToggleStatus(campaign.id, campaign.status)}
                            className={`text-xs px-3 py-1 rounded-full cursor-pointer font-semibold transition-colors ${
                              campaign.status === "Active"
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            }`}
                            title={`Click to ${campaign.status === "Active" ? "pause" : "activate"}`}
                          >
                            {campaign.status}
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(campaign.id, campaign.name)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                            title="Delete campaign"
                          >
                            <MdDelete className="text-lg" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Metrics Row */}
                      <div className="grid grid-cols-4 gap-3 text-sm mb-3">
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <div className="text-xs text-gray-500">Budget</div>
                          <div className="font-bold text-[#2e3e48]">${campaign.budget}</div>
                        </div>
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <div className="text-xs text-gray-500">Spent</div>
                          <div className="font-bold text-[#2e3e48]">${campaign.spent?.toFixed(2) || "0.00"}</div>
                        </div>
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <div className="text-xs text-gray-500">Revenue</div>
                          <div className="font-bold text-green-600">${campaign.revenue?.toFixed(2) || "0.00"}</div>
                        </div>
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <div className="text-xs text-gray-500">Clicks</div>
                          <div className="font-bold text-[#2e3e48]">{campaign.clicks?.toLocaleString() || 0}</div>
                        </div>
                      </div>

                      {/* Target Audience */}
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold text-gray-800">Target:</span> {campaign.target_audience || "Broad audience"}
                      </div>
                      
                      {/* Generated Copy */}
                      {campaign.generated_copy && (
                        <div className="mt-2 text-sm bg-white p-3 rounded border border-gray-200 text-gray-700">
                          <div className="text-xs font-semibold text-gray-500 mb-1">AI Generated Ad Copy:</div>
                          <p className="italic leading-relaxed">&quot;{campaign.generated_copy}&quot;</p>
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
