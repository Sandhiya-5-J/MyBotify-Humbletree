/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import SideBar from "@/components/domain/common/side_bar";
import HeaderWithPopovers from "@/components/common/header";
import Footer from "@/components/common/footer";
import StatsCards from "./StatsCards";
import RevenueChart from "./RevenueChart";
import CampaignPerformance from "./CampaignPerformance";
import PlatformPieChart from "./PlatformPieChart";
import RecentOrders from "./RecentOrders";
import { getMyStores, getStoreAnalytics, getStoreOrders } from "@/api/store";
import { getStoreCampaigns } from "@/api/campaign";

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/");
    } else {
      setAuthChecked(true);
      loadStores();
    }
  }, [router]);

  const loadStores = async () => {
    try {
      const data = await getMyStores();
      setStores(data || []);
      if (data && data.length > 0) {
        setSelectedStoreId(data[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStoreId) {
      loadDashboardData(selectedStoreId);
    }
  }, [selectedStoreId]);

  const loadDashboardData = async (storeId: number) => {
    setLoading(true);
    try {
      const [analyticsData, ordersData, campaignsData] = await Promise.allSettled([
        getStoreAnalytics(storeId),
        getStoreOrders(storeId),
        getStoreCampaigns(storeId),
      ]);

      setAnalytics(
        analyticsData.status === "fulfilled" ? analyticsData.value : null
      );
      setOrders(
        ordersData.status === "fulfilled" ? ordersData.value || [] : []
      );
      setCampaigns(
        campaignsData.status === "fulfilled" ? campaignsData.value || [] : []
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="w-full h-full bg-[#F1F5F2] flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#CAF389] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F1F5F2]">
      <HeaderWithPopovers />
      <div className="flex min-h-[calc(100vh-64px)] flex-col md:flex-row">
        {/* Sidebar */}
        <div className="hidden md:block md:w-[14%] min-h-full">
          <SideBar
            activeTab="analytics"
            onClickTab={() => {}}
            activeInfo=""
            onClickInfo={() => {}}
          />
        </div>

        {/* Main Content */}
        <div className="w-full md:flex-1 flex flex-col border-r-2 border-gray-300">
          <div className="flex-1 overflow-auto px-4 md:px-8 py-6 no-scrollbar">
            {/* Page Title + Store Selector */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#2e3e48]">
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Track your store performance and campaign metrics
                </p>
              </div>

              <div className="flex items-center gap-3">
                {stores.length > 0 && (
                  <select
                    value={selectedStoreId || ""}
                    onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                    className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-[#2e3e48] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#CAF389] focus:border-transparent"
                  >
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.store_name}
                      </option>
                    ))}
                  </select>
                )}
                <select className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-[#2e3e48] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#CAF389] focus:border-transparent">
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="ytd">Year to Date</option>
                </select>
              </div>
            </div>

            {loading ? (
              /* Loading skeleton */
              <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-4 gap-5">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-28 rounded-2xl bg-gray-200/60"
                    />
                  ))}
                </div>
                <div className="h-80 rounded-2xl bg-gray-200/60" />
                <div className="grid grid-cols-2 gap-5">
                  <div className="h-80 rounded-2xl bg-gray-200/60" />
                  <div className="h-80 rounded-2xl bg-gray-200/60" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* KPI Cards */}
                <StatsCards
                  analytics={analytics}
                  campaignCount={campaigns.length}
                />

                {/* Revenue Chart — full width */}
                <RevenueChart monthlyRevenue={analytics?.sales_analysis?.monthly_revenue} />

                {/* Campaign Performance + Platform Pie — side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                  <div className="lg:col-span-3">
                    <CampaignPerformance campaigns={campaigns} />
                  </div>
                  <div className="lg:col-span-2">
                    <PlatformPieChart campaigns={campaigns} />
                  </div>
                </div>

                {/* Recent Orders */}
                <RecentOrders orders={orders} />
              </div>
            )}
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}
