"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaWandMagicSparkles,
  FaArrowTrendUp,
  FaTriangleExclamation,
  FaUsersViewfinder,
  FaEnvelope,
  FaCoins,
  FaBullhorn,
  FaPercent,
  FaLightbulb,
  FaRotateLeft,
  FaCircleInfo,
} from "react-icons/fa6";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#2e3e48] border border-white/10 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs space-y-1 relative z-50">
        <p className="font-semibold text-gray-300 border-b border-white/5 pb-1 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex justify-between gap-4">
            <span style={{ color: entry.stroke }} className="font-medium">
              {entry.name}:
            </span>
            <span className="font-bold font-mono">
              ${entry.value.toLocaleString()}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PredictiveInsights({ prediction, loading }: PredictiveInsightsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("revenue");
  const [mounted, setMounted] = useState(false);

  // --- Interactive Simulation State ---
  const [adSpend, setAdSpend] = useState<number>(0);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [audienceReach, setAudienceReach] = useState<number>(1);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Trigger brief micro-shimmer when sliders change
  const handleSliderChange = (setter: (val: number) => void, val: number) => {
    setter(val);
    setIsCalculating(true);
    const t = setTimeout(() => setIsCalculating(false), 200);
    return () => clearTimeout(t);
  };

  const handleReset = () => {
    setIsCalculating(true);
    setAdSpend(0);
    setDiscountRate(0);
    setAudienceReach(1);
    setTimeout(() => setIsCalculating(false), 200);
  };

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

  // --- Mathematical Simulation Calculations ---
  const baselineWeeklyRevenue = prediction.predicted_revenue || 5000;
  
  // Back-calculate historical parameters from predicted revenue
  const baselineVisitors = 2000;
  const baselineConversionRate = 0.02; // 2% baseline conversion rate
  const baselineConversions = baselineWeeklyRevenue / 100 > 0 ? baselineWeeklyRevenue / 100 : 50; // estimate
  const calculatedAOV = baselineWeeklyRevenue > 0 ? (baselineWeeklyRevenue / baselineConversions) : 100;

  // A. Paid Acquisition Traffic (Ad Spend)
  const cpc = 0.80; // Cost Per Click
  const adVisitors = adSpend / cpc;
  
  // Fatigue coefficient: ad conversion rate degrades slowly at high volumes
  const adFatigueFactor = adSpend > 0 ? (1 - 0.09 * Math.log2(1 + adSpend / 100)) : 1;
  const adConversionRate = baselineConversionRate * Math.max(0.45, adFatigueFactor);

  // B. Promotion Pricing Elasticity (Discount Rate)
  // Elasticity curve: peak multiplier of ~1.76x at 40% discount, but lower order values
  const discountMultiplier = 1 + 2.5 * discountRate - 1.5 * Math.pow(discountRate, 2);
  const discountedAOV = calculatedAOV * (1 - discountRate);

  // C. Audience Scaling (Campaign Reach Multiplier)
  const reachVisitors = baselineVisitors * (audienceReach - 1) * 0.15; // 15% efficiency rate on colder reach list
  const reachConversionRate = baselineConversionRate * 0.6; // slightly lower intent than core baseline visitors

  // D. Combine variables
  const baseConversionsSimulated = baselineConversions * discountMultiplier;
  const adConversionsSimulated = adVisitors * adConversionRate * discountMultiplier;
  const reachConversionsSimulated = reachVisitors * reachConversionRate * discountMultiplier;

  const totalSimulatedConversions = baseConversionsSimulated + adConversionsSimulated + reachConversionsSimulated;
  const simulatedWeeklyRevenue = totalSimulatedConversions * discountedAOV;
  const revenueUpliftPercentage = ((simulatedWeeklyRevenue - baselineWeeklyRevenue) / baselineWeeklyRevenue) * 100;

  // Cost Overhead Calculations
  const adCost = adSpend;
  const discountLostMarginCost = totalSimulatedConversions * calculatedAOV * discountRate;
  const reachOutreachCost = (audienceReach - 1) * 20; // $20 infrastructure overhead per 1x reach increment
  const totalCampaignCosts = adCost + discountLostMarginCost + reachOutreachCost;

  // Simulated Net Profit Impact
  const simulatedNetProfitImpact = (simulatedWeeklyRevenue - baselineWeeklyRevenue) - totalCampaignCosts;

  // ROAS & ROI
  const incrementalRevenue = Math.max(0, simulatedWeeklyRevenue - baselineWeeklyRevenue);
  const simulatedROAS = adSpend > 0 ? (incrementalRevenue - discountLostMarginCost) / adSpend : 0;
  const simulatedMarketingROI = totalCampaignCosts > 0 ? (simulatedNetProfitImpact / totalCampaignCosts) * 100 : 0;

  // Generate Daily 7-Day Area Chart Datasets (Week distribution pattern with peak weekend shopping)
  const generateDailyProjections = () => {
    const weights = [0.12, 0.11, 0.12, 0.13, 0.16, 0.19, 0.17];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, idx) => {
      const weight = weights[idx];
      return {
        day,
        "Baseline Forecast": Math.round(baselineWeeklyRevenue * weight),
        "Simulated Forecast": Math.round(simulatedWeeklyRevenue * weight),
      };
    });
  };

  const chartData = generateDailyProjections();

  // --- Heuristic Marketing Advisor Logic ---
  const getAdvisorRecommendation = () => {
    if (adSpend === 0 && discountRate === 0 && audienceReach === 1) {
      return {
        status: "info",
        title: "Simulation Sandbox Ready",
        message: "Adjust the ad spend, promotional discount, or outreach reach sliders to simulate your Shopify store's growth curve in real-time.",
      };
    }
    if (discountRate >= 0.3 && audienceReach <= 1.5) {
      return {
        status: "warning",
        title: "High Discount Margin Risk",
        message: "You have set a steep " + (discountRate * 100) + "% discount but limited campaign reach. Deep markdowns without massive volume scaling will erode your net profits. Increase reach or lower the discount.",
      };
    }
    if (adSpend >= 800 && discountRate === 0) {
      return {
        status: "tip",
        title: "Pair Traffic with Incentives",
        message: "You are spending $" + adSpend + " on paid ads without discount incentives. Consider offering a moderate 10% or 15% promotional copy to lift landing page conversion rates and maximize ad ROI.",
      };
    }
    if (simulatedWeeklyRevenue > baselineWeeklyRevenue && simulatedNetProfitImpact < 0) {
      return {
        status: "danger",
        title: "Negative Net Profit Warning",
        message: "Although gross sales increased, the campaign costs and discount margin losses exceed your revenue gains. Scale down ad spend or discounts to maintain healthy store profitability.",
      };
    }
    if (simulatedROAS >= 2.5 && simulatedNetProfitImpact > 800) {
      return {
        status: "success",
        title: "Optimal Campaign Sweet Spot!",
        message: "Balanced strategy detected! Combining targeted ads ($" + adSpend + "), strategic pricing (" + (discountRate * 100) + "% off), and high outreach reach projects a stellar " + simulatedROAS.toFixed(1) + "x ROAS and robust net profit uplift.",
      };
    }
    return {
      status: "success",
      title: "Uplift Projection Active",
      message: "This configuration yields an estimated weekly sales uplift of $" + Math.round(incrementalRevenue).toLocaleString() + " (" + revenueUpliftPercentage.toFixed(1) + "% gain) with a positive net impact.",
    };
  };

  const advisor = getAdvisorRecommendation();

  // --- Campaign Trigger Handlers ---
  const handleLaunchCampaign = (segment: any) => {
    const sequenceType = "Promotional Blast";
    const tone = "Urgent & Persuasive";
    const audience = `${segment.segment_name} - ${segment.actionable_recommendation}`;
    
    const query = new URLSearchParams({
      type: sequenceType,
      tone: tone,
      audience: audience,
    }).toString();
    
    router.push(`/emails?${query}`);
  };

  return (
    <div className="bg-[#2e3e48] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Premium glowing background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-purple-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

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
          AI Revenue Forecast & Simulator
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
        
        {/* REVENUE FORECAST & SIMULATOR TAB */}
        {activeTab === "revenue" && (
          <div className="animate-fadeIn space-y-6">
            
            {/* Header section with Magic Sparkle and Reset */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2">
                <FaWandMagicSparkles className="text-[#CAF389] text-xl animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Interactive AI Sales Forecast Simulator
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Slide marketing levers to predict conversion shifts, campaign ROI, and daily sales uplift.
                  </p>
                </div>
              </div>
              
              {(adSpend > 0 || discountRate > 0 || audienceReach > 1) && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all font-semibold"
                >
                  <FaRotateLeft className="text-xs animate-spin-hover" />
                  Reset Sliders
                </button>
              )}
            </div>

            {/* Split Screen Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Controls & Simulated Metrics (5 Cols) */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* Sliders Control Panel */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-[#CAF389] uppercase tracking-wider border-b border-white/5 pb-2">
                    Simulated Marketing Levers
                  </h4>
                  
                  {/* Slider 1: Ad Spend */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        <FaCoins className="text-gray-400 text-xs" />
                        Weekly Ad Spend
                      </span>
                      <span className="bg-[#CAF389] text-[#2e3e48] px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                        ${adSpend.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={2000}
                      step={50}
                      value={adSpend}
                      onChange={(e) => handleSliderChange(setAdSpend, Number(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#CAF389] focus:outline-none"
                    />
                    <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                      <span>$0</span>
                      <span>$1k</span>
                      <span>$2k</span>
                    </div>
                  </div>

                  {/* Slider 2: Discount Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        <FaPercent className="text-gray-400 text-xs" />
                        Promotional Discount
                      </span>
                      <span className="bg-[#CAF389] text-[#2e3e48] px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                        {Math.round(discountRate * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={0.4}
                      step={0.05}
                      value={discountRate}
                      onChange={(e) => handleSliderChange(setDiscountRate, Number(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#CAF389] focus:outline-none"
                    />
                    <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                      <span>0%</span>
                      <span>20%</span>
                      <span>40%</span>
                    </div>
                  </div>

                  {/* Slider 3: Campaign Reach */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        <FaBullhorn className="text-gray-400 text-xs" />
                        Campaign Reach Multiplier
                      </span>
                      <span className="bg-[#CAF389] text-[#2e3e48] px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                        {audienceReach.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={0.5}
                      value={audienceReach}
                      onChange={(e) => handleSliderChange(setAudienceReach, Number(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#CAF389] focus:outline-none"
                    />
                    <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                      <span>1.0x (Standard)</span>
                      <span>3.0x</span>
                      <span>5.0x</span>
                    </div>
                  </div>
                </div>

                {/* Simulated ROI Metrics Dashboard */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-[#CAF389] uppercase tracking-wider border-b border-white/5 pb-2">
                    Simulated Performance Metrics
                  </h4>
                  
                  <div className={`grid grid-cols-2 gap-3 relative transition-all duration-200 ${isCalculating ? "opacity-40 animate-pulse" : ""}`}>
                    
                    {/* Metric 1: Revenue Projected */}
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                      <span className="text-[10px] text-gray-400 font-medium">Projected Revenue</span>
                      <div className="mt-1 flex flex-col">
                        <span className="text-lg font-bold font-mono text-white">
                          ${Math.round(simulatedWeeklyRevenue).toLocaleString()}
                        </span>
                        <span className={`text-[9px] font-semibold flex items-center gap-1 mt-0.5 ${revenueUpliftPercentage >= 0 ? "text-[#CAF389]" : "text-red-400"}`}>
                          {revenueUpliftPercentage >= 0 ? "+" : ""}{revenueUpliftPercentage.toFixed(1)}% vs base
                        </span>
                      </div>
                    </div>

                    {/* Metric 2: Net Profit Impact */}
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                      <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                        Net Profit Impact
                        <span title="Net Profit = Incremental Revenue - Ad Costs - Discount Cost - outreach overhead" className="cursor-help">
                          <FaCircleInfo className="text-[9px] text-gray-500" />
                        </span>
                      </span>
                      <div className="mt-1 flex flex-col">
                        <span className={`text-lg font-bold font-mono ${simulatedNetProfitImpact >= 0 ? "text-[#CAF389]" : "text-red-400"}`}>
                          {simulatedNetProfitImpact >= 0 ? "+" : ""}${Math.round(simulatedNetProfitImpact).toLocaleString()}
                        </span>
                        <span className="text-[9px] text-gray-400 font-semibold mt-0.5">
                          {simulatedNetProfitImpact >= 0 ? "Campaign profit" : "Margin shortfall"}
                        </span>
                      </div>
                    </div>

                    {/* Metric 3: Return on Ad Spend */}
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                      <span className="text-[10px] text-gray-400 font-medium">Simulated ROAS</span>
                      <div className="mt-1 flex flex-col">
                        <span className="text-lg font-bold font-mono text-white">
                          {adSpend > 0 ? `${simulatedROAS.toFixed(2)}x` : "0.00x"}
                        </span>
                        <span className="text-[9px] text-gray-400 font-semibold mt-0.5">
                          {adSpend > 0 ? "Return on ad budget" : "No ad spend set"}
                        </span>
                      </div>
                    </div>

                    {/* Metric 4: Campaign Marketing ROI */}
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                      <span className="text-[10px] text-gray-400 font-medium">Marketing ROI</span>
                      <div className="mt-1 flex flex-col">
                        <span className={`text-lg font-bold font-mono ${simulatedMarketingROI >= 0 ? "text-[#CAF389]" : "text-red-400"}`}>
                          {simulatedMarketingROI.toFixed(1)}%
                        </span>
                        <span className="text-[9px] text-gray-400 font-semibold mt-0.5">
                          Return on investment
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Recharts comparison graph & Advisor Feed (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* 7-Day Forecast Area Comparison Chart */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-[#CAF389] uppercase tracking-wider">
                      7-Day Daily Forecast Comparison
                    </h4>
                    <div className="flex items-center gap-4 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-gray-500 opacity-70" />
                        <span className="text-gray-300">Baseline</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#CAF389]" />
                        <span className="text-[#CAF389] font-medium">Simulated</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-64 md:h-72 w-full mt-4 bg-white/5 rounded-xl p-4 border border-white/5 relative flex items-center justify-center">
                    {mounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={chartData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="baseGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#9ca3af" stopOpacity={0.01} />
                            </linearGradient>
                            <linearGradient id="simGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#CAF389" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#CAF389" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis
                            dataKey="day"
                            tick={{ fontSize: 10, fill: "#9ca3af" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: "#9ca3af" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `$${v}`}
                          />
                          <Tooltip content={<CustomChartTooltip />} />
                          
                          {/* Baseline Forecast line */}
                          <Area
                            name="Baseline Forecast"
                            type="monotone"
                            dataKey="Baseline Forecast"
                            stroke="#9ca3af"
                            strokeWidth={2}
                            fill="url(#baseGradient)"
                            strokeDasharray="4 4"
                            dot={false}
                          />
                          
                          {/* Simulated Forecast Area */}
                          <Area
                            name="Simulated Forecast"
                            type="monotone"
                            dataKey="Simulated Forecast"
                            stroke="#CAF389"
                            strokeWidth={2.5}
                            fill="url(#simGradient)"
                            dot={{ r: 3, fill: "#CAF389", stroke: "#2e3e48", strokeWidth: 1.5 }}
                            activeDot={{ r: 5, fill: "#CAF389", stroke: "#2e3e48", strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-gray-400 text-xs">Loading chart projections...</div>
                    )}
                  </div>
                </div>

                {/* Glassmorphism AI Advisor Feedback Box */}
                <div className={`p-4 rounded-xl border transition-all duration-300 flex gap-3 items-start relative overflow-hidden ${
                  advisor.status === "warning" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-100" :
                  advisor.status === "danger" ? "bg-red-500/10 border-red-500/30 text-red-100" :
                  advisor.status === "tip" ? "bg-purple-500/10 border-purple-500/30 text-purple-100" :
                  advisor.status === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-100" :
                  "bg-white/5 border-white/10 text-gray-200"
                }`}>
                  <div className={`p-2 rounded-lg ${
                    advisor.status === "warning" ? "bg-yellow-500/20 text-yellow-300" :
                    advisor.status === "danger" ? "bg-red-500/20 text-red-300" :
                    advisor.status === "tip" ? "bg-purple-500/20 text-purple-300" :
                    advisor.status === "success" ? "bg-emerald-500/20 text-emerald-300" :
                    "bg-white/10 text-gray-300"
                  }`}>
                    {advisor.status === "warning" ? <FaTriangleExclamation className="text-sm" /> :
                     advisor.status === "danger" ? <FaTriangleExclamation className="text-sm" /> :
                     advisor.status === "tip" ? <FaCircleInfo className="text-sm" /> :
                     <FaLightbulb className="text-sm animate-pulse" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      AI Advisor Feedback: <span className="opacity-90">{advisor.title}</span>
                    </h5>
                    <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                      {advisor.message}
                    </p>
                  </div>
                </div>

                {/* Base Actionable Insights list from backend */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h4 className="text-xs font-bold text-[#CAF389] uppercase tracking-wider mb-3">
                    Actionable Growth Insights
                  </h4>
                  <ul className="space-y-2.5">
                    {prediction.insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-200">
                        <span className="text-[#CAF389] mt-0.5">•</span>
                        <span className="leading-relaxed">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

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
