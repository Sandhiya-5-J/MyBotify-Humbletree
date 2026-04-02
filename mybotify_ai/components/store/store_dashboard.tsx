/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoreAnalytics, uploadProductsCSV, uploadOrdersCSV, uploadCustomersCSV } from "@/api/store";
import { getToken } from "@/lib/auth";
import MarketAnalysis from "./market_analysis";
import SalesAnalysis from "./sales_analysis";
import CustomerAnalysis from "./customer_analysis";
import ChatBar from "@/components/account/common/chat_bar";
import HeaderWithPopovers from "@/components/common/header";
import { IoArrowBack } from "react-icons/io5";
import { MdStorefront, MdUpload } from "react-icons/md";

type Props = { storeId: number };

export default function StoreDashboard({ storeId }: Props) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"market" | "sales" | "customers">("market");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) {
      router.push("/account");
      return;
    }
    fetchAnalytics();
  }, [storeId]);

  const fetchAnalytics = () => {
    setLoading(true);
    getStoreAnalytics(storeId)
      .then((data) => setAnalytics(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleUpload = async (type: "products" | "orders" | "customers") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        if (type === "products") {
          await uploadProductsCSV(storeId, file);
        } else if (type === "orders") {
          await uploadOrdersCSV(storeId, file);
        } else {
          await uploadCustomersCSV(storeId, file);
        }
        fetchAnalytics();
      } catch (err: any) {
        alert(err.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F5F2] flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-[#F1F5F2] flex items-center justify-center">
        <div className="text-gray-500 text-sm">Store not found</div>
      </div>
    );
  }

  const store = analytics.store;

  return (
    <div className="w-full h-full bg-[#F1F5F2] min-h-screen">
      {/* Header */}
      <HeaderWithPopovers />

      {/* Main layout: Content + ChatBar */}
      <div className="flex h-[90%]">
        {/* Analytics Content */}
        <div className="w-[75%] h-full flex flex-col border-r-2 border-gray-300 overflow-auto">
          {/* Store header bar */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/account")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IoArrowBack size={20} className="text-[#2E3E48]" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2E3E48] rounded-lg flex items-center justify-center">
                    <MdStorefront className="text-white text-xl" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-[#2E3E48]">{store.store_name}</h1>
                    <p className="text-xs text-gray-500">
                      {store.store_url || "Manual Store"} · {store.currency || "USD"} · {store.country || "USA"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload buttons */}
              <div className="flex gap-2 flex-wrap justify-end max-w-[400px]">
                <button
                  onClick={() => handleUpload("products")}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium disabled:opacity-50"
                >
                  <MdUpload size={14} /> Products CSV
                </button>
                <button
                  onClick={() => handleUpload("orders")}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium disabled:opacity-50"
                >
                  <MdUpload size={14} /> Orders CSV
                </button>
                <button
                  onClick={() => handleUpload("customers")}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium disabled:opacity-50"
                >
                  <MdUpload size={14} /> Customers CSV
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab("market")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "market"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                📊 Market Analysis
              </button>
              <button
                onClick={() => setActiveTab("sales")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "sales"
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                💰 Sales Analysis
              </button>
              <button
                onClick={() => setActiveTab("customers")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "customers"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                👥 Customer Analysis
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 flex-1 overflow-auto">
            {activeTab === "market" ? (
              <MarketAnalysis data={analytics.market_analysis} currency={store.currency || "USD"} />
            ) : activeTab === "sales" ? (
              <SalesAnalysis data={analytics.sales_analysis} currency={store.currency || "USD"} />
            ) : (
              <CustomerAnalysis data={analytics.customer_analysis} currency={store.currency || "USD"} />
            )}
          </div>
        </div>

        {/* AI Chat Agent */}
        <ChatBar addAccountChat={""} storeId={storeId} />
      </div>
    </div>
  );
}
