"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaWandMagicSparkles, FaArrowTrendUp, FaTriangleExclamation, FaUsersViewfinder, FaEnvelope } from "react-icons/fa6";

interface PredictiveInsightsProps {
  prediction: {
    predicted_revenue: number;
    growth_percentage: string;
    insights: string[];
    inventory_forecast?: Array<{
      product_title: string;
      current_inventory: number;
      days_to_sell_out: number;
      sales_velocity_weekly: number;
      risk_level: string;
    }>;
    churn_risk_analysis?: {
      overall_churn_rate: string;
      risk_segments: Array<{
        segment_name: string;
        size: number;
        churn_probability: string;
        actionable_recommendation: string;
      }>;
    };
  } | null;
  loading: boolean;
}

type TabType = "revenue" | "inventory" | "churn";

export default function PredictiveInsights({ prediction, loading }: PredictiveInsightsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("revenue");

  if (loading) {
    return (
      <div className="bg-[#2e3e48] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden animate-pulse min-h-[220px]">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent" />
        <div className="flex gap-3 mb-6">
          <div className="h-9 w-28 bg-gray-600 rounded-lg"></div>
          <div className="h-9 w-28 bg-gray-600 rounded-lg"></div>
          <div className="h-9 w-28 bg-gray-600 rounded-lg"></div>
        </div>
        <div className="h-6 w-48 bg-gray-600 rounded mb-4"></div>
        <div className="h-10 w-32 bg-gray-600 rounded mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-600 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  const isPositive = prediction.growth_percentage.startsWith("+");
  const inventoryItems = prediction.inventory_forecast || [];
  const churnAnalysis = prediction.churn_risk_analysis;

  const handleLaunchCampaign = (segment: any) => {
    const sequenceType = "Promotional Blast";
    const tone = "Urgent & Persuasive";
    const audience = `${segment.segment_name} - ${segment.actionable_recommendation}`;
    
    // Navigate to Emails dashboard passing cohort details in query params
    const query = new URLSearchParams({
      type: sequenceType,
      tone: tone,
      audience: audience
    }).toString();
    
    router.push(`/emails?${query}`);
  };

  return (
    <div className="bg-[#2e3e48] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Premium glowing background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Tabs Controller */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4 relative z-10">
        <button
          onClick={() => setActiveTab("revenue")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
            activeTab === "revenue"
              ? "bg-[#CAF389] text-[#2e3e48] shadow-md shadow-[#CAF389]/20 scale-105"
              : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5"
          }`}
        >
          <FaArrowTrendUp className="text-sm" />
          Revenue Forecast
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
            activeTab === "inventory"
              ? "bg-[#CAF389] text-[#2e3e48] shadow-md shadow-[#CAF389]/20 scale-105"
              : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5"
          }`}
        >
          <FaTriangleExclamation className="text-sm" />
          Stockout Risks ({inventoryItems.length})
        </button>
        <button
          onClick={() => setActiveTab("churn")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
            activeTab === "churn"
              ? "bg-[#CAF389] text-[#2e3e48] shadow-md shadow-[#CAF389]/20 scale-105"
              : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5"
          }`}
        >
          <FaUsersViewfinder className="text-sm" />
          Churn Analysis
        </button>
      </div>

      {/* Tab Panel Contents */}
      <div className="relative z-10">
        {/* REVENUE FORECAST TAB */}
        {activeTab === "revenue" && (
          <div className="flex flex-col md:flex-row gap-6 md:items-center animate-fadeIn">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <FaWandMagicSparkles className="text-[#CAF389] text-xl animate-pulse" />
                <h3 className="text-xs font-semibold tracking-wider text-gray-300 uppercase">
                  AI Revenue Forecast (Next 7 Days)
                </h3>
              </div>
              <div className="flex items-end gap-3">
                <h2 className="text-4xl font-bold text-white tracking-tight">
                  ${prediction.predicted_revenue.toLocaleString()}
                </h2>
                <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-bold mb-1 ${isPositive ? "bg-[#CAF389] text-[#2e3e48]" : "bg-red-400 text-white"}`}>
                  {prediction.growth_percentage}
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-xs font-semibold text-[#CAF389] uppercase tracking-wider mb-3">
                Actionable Forecast Insights
              </h4>
              <ul className="space-y-2.5">
                {prediction.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-200">
                    <span className="text-[#CAF389] mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* INVENTORY STOCKOUT FORECAST TAB */}
        {activeTab === "inventory" && (
          <div className="animate-fadeIn">
            {inventoryItems.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <FaTriangleExclamation className="text-3xl text-gray-500 mx-auto mb-2" />
                <p className="text-sm">No critical inventory stockout risks detected. All stocks are healthy!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventoryItems.map((item, idx) => {
                  const isHigh = item.risk_level === "High";
                  return (
                    <div
                      key={idx}
                      className="bg-white/5 border border-white/10 hover:border-[#CAF389]/40 rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <h4 className="font-bold text-sm text-white truncate max-w-[70%]">
                          {item.product_title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isHigh ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        }`}>
                          {item.risk_level} Risk
                        </span>
                      </div>
                      <div className="space-y-2 text-xs text-gray-300">
                        <div className="flex justify-between">
                          <span>Current Stock:</span>
                          <span className="font-semibold text-white">{item.current_inventory} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Weekly Velocity:</span>
                          <span className="font-semibold text-white">{item.sales_velocity_weekly} sold / wk</span>
                        </div>
                        <div className="pt-2 border-t border-white/5 flex justify-between items-center text-sm">
                          <span className="text-gray-400">Predicted Stockout:</span>
                          <span className={`font-bold ${isHigh ? "text-red-400 animate-pulse" : "text-yellow-400"}`}>
                            In {item.days_to_sell_out} days
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CUSTOMER CHURN RISK TAB */}
        {activeTab === "churn" && (
          <div className="animate-fadeIn space-y-4">
            {!churnAnalysis || !churnAnalysis.risk_segments || churnAnalysis.risk_segments.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <FaUsersViewfinder className="text-3xl text-gray-500 mx-auto mb-2" />
                <p className="text-sm">Not enough cohort data available to build churn segment forecasts.</p>
              </div>
            ) : (
              <div>
                {/* Overall Banner */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider">Overall Customer Churn Rate</h4>
                    <p className="text-3xl font-bold text-white mt-1">{churnAnalysis.overall_churn_rate}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#CAF389] font-medium bg-[#CAF389]/10 px-3 py-1 rounded-full">
                      AI Segmentation Active
                    </span>
                  </div>
                </div>

                {/* Cohort Segments List */}
                <div className="space-y-3">
                  {churnAnalysis.risk_segments.map((segment, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm text-[#CAF389]">{segment.segment_name}</h4>
                          <span className="text-[10px] text-gray-400">({segment.size} customers)</span>
                        </div>
                        <p className="text-xs text-gray-300 mt-1">
                          <strong className="text-white">AI Suggestion:</strong> {segment.actionable_recommendation}
                        </p>
                      </div>
                      <div className="flex md:flex-row items-center gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-white/5 justify-between md:justify-end">
                        <div className="flex flex-col items-start md:items-end">
                          <span className="text-[10px] text-gray-400">Churn Probability:</span>
                          <span className="text-sm font-bold text-red-400">{segment.churn_probability}</span>
                        </div>
                        <button
                          onClick={() => handleLaunchCampaign(segment)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#CAF389] text-[#2e3e48] hover:bg-[#b0df6f] transition-all hover:scale-105 active:scale-95 shadow-sm shadow-[#CAF389]/10"
                        >
                          <FaEnvelope className="text-xs" />
                          Launch Campaign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
