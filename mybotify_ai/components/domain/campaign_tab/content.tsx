"use client";

import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaRegBuilding } from "react-icons/fa";
import { MdAdd, MdDelete } from "react-icons/md";
import { SiGoogleads } from "react-icons/si";
import { FaMoneyCheck } from "react-icons/fa6";
import { IoStatsChart } from "react-icons/io5";
import { HiOutlineSparkles } from "react-icons/hi2";
import { FiArrowRight, FiCheckCircle, FiChevronDown, FiChevronUp, FiAward, FiSliders, FiActivity, FiSettings, FiAlertTriangle, FiList, FiTrendingUp } from "react-icons/fi";
import { getMyStores } from "@/api/store";
import { 
  getStoreCampaigns, 
  deleteCampaign, 
  updateCampaign, 
  getCampaignOptimization, 
  applyCampaignOptimization,
  getCampaignVariants,
  generateABVariants,
  updateVariantStatus,
  declareVariantWinner
} from "@/api/campaign";
import AddCampaignModal from "./add_campaign_modal";
import toast from "react-hot-toast";

export default function ContentCampaign() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  // AI Budget Optimizer state
  const [optimizeStoreId, setOptimizeStoreId] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [applying, setApplying] = useState(false);
  const [optimizeDone, setOptimizeDone] = useState(false);

  // A/B Testing states
  const [expandedCampaignId, setExpandedCampaignId] = useState<number | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [generatingVariants, setGeneratingVariants] = useState(false);
  const [declaringWinnerId, setDeclaringWinnerId] = useState<number | null>(null);

  // Automated Guardrails & Rules State
  const [showRuleBuilder, setShowRuleBuilder] = useState<number | null>(null); // campaignId
  const [activeRules, setActiveRules] = useState<Record<number, any>>({}); // campaignId -> rules config
  const [ruleLogs, setRuleLogs] = useState<Record<number, Array<{ timestamp: string; message: string; type: "info" | "success" | "warning" | "error" }>>>({});
  const [ruleNotification, setRuleNotification] = useState<{ campaignId: number; message: string; type: "pause" | "winner" } | null>(null);

  // Load guardrails on load
  const loadGuardrailRules = (campaignId: number) => {
    try {
      const saved = localStorage.getItem(`guardrails_c_${campaignId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load rules", e);
    }
    return {
      roasGuardrailEnabled: false,
      roasMinLimit: 1.5,
      roasSpendThreshold: 100,
      winnerAutoEnabled: false,
      winnerMinRoasUplift: 25,
      winnerClickThreshold: 200,
    };
  };

  const saveGuardrailRules = (campaignId: number, newRules: any) => {
    try {
      localStorage.setItem(`guardrails_c_${campaignId}`, JSON.stringify(newRules));
      setActiveRules((prev) => ({ ...prev, [campaignId]: newRules }));
      addRuleLog(campaignId, "Rules updated and saved successfully.", "success");
    } catch (e) {
      console.error("Failed to save rules", e);
    }
  };

  const addRuleLog = (campaignId: number, message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setRuleLogs((prev) => {
      const logs = prev[campaignId] || [];
      return {
        ...prev,
        [campaignId]: [{ timestamp, message, type }, ...logs].slice(0, 10), // keep last 10 logs
      };
    });
  };

  // Automated boundary checker engine
  const evaluateGuardrailRules = async (campaignId: number, variantsList: any[], currentRules: any) => {
    if (!variantsList || variantsList.length === 0) return;
    if (variantsList.some(v => v.is_winner)) return;

    const activeVars = variantsList.filter(v => v.is_active);
    
    // 1. ROAS Underperformance Auto-Pause
    if (currentRules.roasGuardrailEnabled) {
      for (const variant of activeVars) {
        const spent = variant.spent || 0;
        const revenue = variant.revenue || 0;
        const roas = spent > 0 ? revenue / spent : 0;
        
        if (spent >= currentRules.roasSpendThreshold && roas < currentRules.roasMinLimit) {
          addRuleLog(campaignId, `⚠️ Guardrail TRIGGERED: Variant "${variant.name}" has spent $${spent.toFixed(2)} with ROAS of ${roas.toFixed(2)}x (below limit of ${currentRules.roasMinLimit}x).`, "warning");
          try {
            await updateVariantStatus(campaignId, variant.id, false);
            setRuleNotification({
              campaignId,
              message: `🔴 Automated Guardrail: Variant "${variant.name}" has been auto-paused due to low ROAS (${roas.toFixed(2)}x < ${currentRules.roasMinLimit.toFixed(1)}x threshold).`,
              type: "pause"
            });
            
            const res = await getCampaignVariants(campaignId);
            setVariants(res || []);
            fetchStoresAndCampaigns();
            addRuleLog(campaignId, `🔴 Variant "${variant.name}" paused automatically by ROAS guardrail.`, "error");
            
            setTimeout(() => setRuleNotification(null), 6000);
            return;
          } catch (err: any) {
            console.error("Auto-pause failed", err);
            addRuleLog(campaignId, `❌ Failed to auto-pause Variant "${variant.name}": ${err.message}`, "error");
          }
        }
      }
    }

    // 2. High-Performance Auto-Winner Promotion
    if (currentRules.winnerAutoEnabled && activeVars.length >= 2) {
      for (const variant of activeVars) {
        const clicks = variant.clicks || 0;
        const spent = variant.spent || 0;
        const revenue = variant.revenue || 0;
        const roas = spent > 0 ? revenue / spent : 0;
        
        if (clicks >= currentRules.winnerClickThreshold) {
          const otherVars = activeVars.filter(ov => ov.id !== variant.id);
          const isWinner = otherVars.every(ov => {
            const ovSpent = ov.spent || 0;
            const ovRevenue = ov.revenue || 0;
            const ovRoas = ovSpent > 0 ? ovRevenue / ovSpent : 0;
            const roasDifference = ovRoas > 0 ? (roas / ovRoas - 1) * 100 : roas > 0 ? 100 : 0;
            return roasDifference >= currentRules.winnerMinRoasUplift;
          });

          if (isWinner) {
            addRuleLog(campaignId, `🏆 Auto-Winner TRIGGERED: Variant "${variant.name}" reached ${clicks} clicks with superior ROAS.`, "success");
            try {
              await declareVariantWinner(campaignId, variant.id);
              setRuleNotification({
                campaignId,
                message: `🏆 Auto-Winner Promoted! Variant "${variant.name}" declared winner automatically due to superior performance (+${currentRules.winnerMinRoasUplift}% ROAS margin).`,
                type: "winner"
              });
              
              const res = await getCampaignVariants(campaignId);
              setVariants(res || []);
              fetchStoresAndCampaigns();
              addRuleLog(campaignId, `🎉 Variant "${variant.name}" successfully promoted as final winner in the database!`, "success");
              
              setTimeout(() => setRuleNotification(null), 6000);
              return;
            } catch (err: any) {
              console.error("Auto-declare winner failed", err);
              addRuleLog(campaignId, `❌ Failed to auto-declare winner: ${err.message}`, "error");
            }
          }
        }
      }
    }

    addRuleLog(campaignId, "Rules check complete. Variations are within performance boundaries.", "info");
  };

  const handleSaveRulesConfig = async (campaignId: number, newRules: any) => {
    saveGuardrailRules(campaignId, newRules);
    await evaluateGuardrailRules(campaignId, variants, newRules);
  };

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

  // AI Budget Optimizer handlers
  const handleScanOptimize = async () => {
    const storeId = optimizeStoreId || (stores.length > 0 ? stores[0].id : null);
    if (!storeId) {
      toast.error("Please connect a store first.");
      return;
    }
    setScanning(true);
    setRecommendations([]);
    setOptimizeDone(false);
    try {
      const result = await getCampaignOptimization(storeId);
      setRecommendations(result?.recommendations || []);
      if (!result?.recommendations?.length) {
        toast("No optimization opportunities found. All campaigns are performing well!", { icon: "👍" });
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to scan campaigns");
    } finally {
      setScanning(false);
    }
  };

  const handleApplyOptimization = async () => {
    if (!recommendations.length) return;
    setApplying(true);
    try {
      await applyCampaignOptimization(recommendations);
      toast.success("🎉 AI budget reallocations applied successfully!");
      setOptimizeDone(true);
      setRecommendations([]);
      fetchStoresAndCampaigns();
    } catch (e: any) {
      toast.error(e.message || "Failed to apply optimizations");
    } finally {
      setApplying(false);
    }
  };

  // A/B Testing handlers
  const handleToggleABTesting = async (campaignId: number) => {
    if (expandedCampaignId === campaignId) {
      setExpandedCampaignId(null);
      setVariants([]);
      setShowRuleBuilder(null);
      return;
    }
    setExpandedCampaignId(campaignId);
    setLoadingVariants(true);
    try {
      const res = await getCampaignVariants(campaignId);
      setVariants(res || []);
      
      // Load rules and run active boundary checks
      const rulesObj = loadGuardrailRules(campaignId);
      setActiveRules(prev => ({ ...prev, [campaignId]: rulesObj }));
      
      if (!ruleLogs[campaignId] || ruleLogs[campaignId].length === 0) {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setRuleLogs(prev => ({
          ...prev,
          [campaignId]: [
            { timestamp, message: "Monitoring engine initialized for A/B Test.", type: "info" }
          ]
        }));
      }
      
      await evaluateGuardrailRules(campaignId, res || [], rulesObj);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch variants");
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleGenerateABVariants = async (campaignId: number) => {
    setGeneratingVariants(true);
    try {
      const res = await generateABVariants(campaignId);
      if (res && res.length > 0) {
        setVariants(res);
        toast.success("🧪 AI A/B Test Variations generated successfully!");
        fetchStoresAndCampaigns();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate variations");
    } finally {
      setGeneratingVariants(false);
    }
  };

  const handleToggleVariantStatus = async (campaignId: number, variantId: number, currentActive: boolean) => {
    try {
      const updated = await updateVariantStatus(campaignId, variantId, !currentActive);
      toast.success(`Variant ${!currentActive ? "activated" : "paused"} successfully`);
      setVariants(prev => prev.map(v => v.id === variantId ? updated : v));
      fetchStoresAndCampaigns();
    } catch (err: any) {
      toast.error(err.message || "Failed to update variant status");
    }
  };

  const handleDeclareWinner = async (campaignId: number, variantId: number) => {
    setDeclaringWinnerId(variantId);
    try {
      const updated = await declareVariantWinner(campaignId, variantId);
      toast.success("🎉 Winning variant promoted successfully!");
      setVariants(prev => prev.map(v => v.id === variantId ? updated : { ...v, is_winner: false, is_active: false }));
      fetchStoresAndCampaigns();
    } catch (err: any) {
      toast.error(err.message || "Failed to declare variant winner");
    } finally {
      setDeclaringWinnerId(null);
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

        {/* AI Budget Optimizer Panel */}
        <div className="px-4 pb-2">
          <div className="relative overflow-hidden rounded-xl border border-[#caf389]/50 bg-gradient-to-br from-[#f0fce0] via-white to-[#edffd6] p-5 shadow-md">
            {/* Decorative glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#caf389] rounded-full opacity-20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#2e3e48] rounded-full opacity-5 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-[#2e3e48] to-[#1a2329] h-10 w-10 flex justify-center items-center rounded-lg shadow-lg">
                  <HiOutlineSparkles className="text-[#caf389] text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2e3e48] text-lg">AI Budget Optimizer</h3>
                  <p className="text-xs text-gray-500">Powered by Gemini &mdash; analyzes ROAS, clicks, and spend to maximize your returns</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {stores.length > 1 && (
                  <select
                    value={optimizeStoreId || stores[0]?.id || ""}
                    onChange={(e) => setOptimizeStoreId(Number(e.target.value))}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#caf389]"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>{s.store_name}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={handleScanOptimize}
                  disabled={scanning || stores.length === 0}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#2e3e48] to-[#1a2329] hover:from-[#1a2329] hover:to-[#0d1215] disabled:opacity-50 transition-all px-5 py-2.5 text-white font-semibold rounded-xl text-sm shadow-lg hover:shadow-xl"
                >
                  {scanning ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-[#caf389]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <HiOutlineSparkles className="text-[#caf389]" />
                      Scan &amp; Optimize Budgets
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scanning animation */}
            {scanning && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-[#caf389]/30 rounded-full" />
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[#2e3e48] rounded-full animate-spin" />
                </div>
                <p className="text-sm text-gray-500 font-medium animate-pulse">AI is analyzing campaign performance across all platforms...</p>
              </div>
            )}

            {/* Recommendations list */}
            {!scanning && recommendations.length > 0 && (
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-[#caf389] hover:shadow-sm transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {/* From campaign */}
                      <div className="flex-1 bg-red-50 rounded-lg p-3 border border-red-100">
                        <div className="text-xs text-red-400 font-semibold mb-1">REDUCE BUDGET</div>
                        <div className="font-bold text-[#2e3e48] text-sm">{rec.campaign_name_from}</div>
                        <div className="text-red-600 font-bold text-lg">-${rec.amount_to_shift?.toFixed(2)}</div>
                      </div>

                      {/* Arrow */}
                      <div className="flex flex-col items-center">
                        <FiArrowRight className="text-[#2e3e48] text-xl" />
                        <span className="text-[10px] text-[#2e3e48] font-bold bg-[#caf389] px-2 py-0.5 rounded-full mt-1">{rec.expected_impact}</span>
                      </div>

                      {/* To campaign */}
                      <div className="flex-1 bg-green-50 rounded-lg p-3 border border-green-100">
                        <div className="text-xs text-green-500 font-semibold mb-1">BOOST BUDGET</div>
                        <div className="font-bold text-[#2e3e48] text-sm">{rec.campaign_name_to}</div>
                        <div className="text-green-600 font-bold text-lg">+${rec.amount_to_shift?.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded p-2 border border-gray-100">
                      <span className="font-semibold text-gray-700">AI Reasoning:</span> {rec.reasoning}
                    </div>
                  </div>
                ))}

                {/* Apply button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleApplyOptimization}
                    disabled={applying}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all px-6 py-3 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-xl"
                  >
                    {applying ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Applying...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle />
                        Apply AI Reallocations
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Success state after applying */}
            {optimizeDone && recommendations.length === 0 && !scanning && (
              <div className="flex items-center gap-3 py-4 px-3 bg-green-50 rounded-lg border border-green-200">
                <FiCheckCircle className="text-green-600 text-2xl flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 text-sm">Optimization Applied!</p>
                  <p className="text-xs text-green-600">Campaign budgets have been updated. Check the metrics below for the new allocations.</p>
                </div>
              </div>
            )}
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
                      
                      {/* Generated Copy and Creative */}
                      {(campaign.generated_copy || campaign.ad_creative_url) && (
                        <div className="mt-2 text-sm bg-white p-3 rounded border border-gray-200 text-gray-700 flex flex-col md:flex-row gap-4">
                          {campaign.generated_copy && (
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-gray-500 mb-1">AI Generated Ad Copy:</div>
                              <p className="italic leading-relaxed whitespace-pre-wrap">&quot;{campaign.generated_copy}&quot;</p>
                            </div>
                          )}
                          {campaign.ad_creative_url && (
                            <div className="w-full md:w-[150px] shrink-0">
                              <div className="text-xs font-semibold text-gray-500 mb-1">Creative:</div>
                              <div className="w-full aspect-square rounded border overflow-hidden shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={campaign.ad_creative_url} alt="Campaign Creative" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* A/B Testing Toggle Button */}
                      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                        <button
                          onClick={() => handleToggleABTesting(campaign.id)}
                          className="flex items-center gap-2 text-xs font-bold text-[#2e3e48] bg-white border border-gray-200 hover:border-[#CAF389] hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                        >
                          <FiSliders className="text-[#2e3e48]" />
                          <span>Ad Copy A/B Testing</span>
                          {expandedCampaignId === campaign.id ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        {variants.length > 0 && expandedCampaignId === campaign.id && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold bg-white border border-gray-100 px-2 py-1 rounded-md">
                            <FiActivity className="text-[#CAF389] animate-pulse" />
                            <span>{variants.filter(v => v.is_active).length} Active Variations</span>
                          </div>
                        )}
                      </div>

                      {/* A/B Testing Expandable Dashboard */}
                      {expandedCampaignId === campaign.id && (
                        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl space-y-4 shadow-inner">
                          {loadingVariants ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                              <div className="w-8 h-8 border-3 border-[#CAF389] border-t-transparent rounded-full animate-spin" />
                              <p className="text-xs text-gray-500 font-medium">Fetching A/B test variants...</p>
                            </div>
                          ) : variants.length === 0 ? (
                            <div className="text-center py-6 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                              <FiSliders className="mx-auto text-gray-300 text-4xl mb-2" />
                              <h4 className="font-bold text-[#2e3e48] text-sm mb-1">No Ad Variants Configured</h4>
                              <p className="text-xs text-gray-400 mb-4 max-w-md mx-auto">Generate multiple AI copy and image variations for this campaign to let our platform auto-optimize for the best conversion rate!</p>
                              
                              <button
                                onClick={() => handleGenerateABVariants(campaign.id)}
                                disabled={generatingVariants}
                                className="flex items-center gap-2 mx-auto bg-gradient-to-br from-[#2e3e48] to-[#1C282F] hover:from-[#1C282F] hover:to-[#0D161A] text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow disabled:opacity-50 transition-all"
                              >
                                {generatingVariants ? (
                                  <>
                                    <svg className="animate-spin h-3.5 w-3.5 text-[#caf389]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating A/B Variants...
                                  </>
                                ) : (
                                  <>
                                    <HiOutlineSparkles className="text-[#caf389]" />
                                    Setup AI A/B Test (2 angles)
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-2 gap-2">
                                <div>
                                  <h4 className="font-bold text-[#2e3e48] text-sm">🧪 A/B Split Test Dashboard</h4>
                                  <p className="text-[11px] text-gray-400">Comparing active variations. Traffic and metrics are synced per variant.</p>
                                </div>
                                {!variants.some(v => v.is_winner) && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setShowRuleBuilder(showRuleBuilder === campaign.id ? null : campaign.id)}
                                      className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#CAF389] hover:bg-gray-50 text-[#2e3e48] font-bold text-[10px] py-1 px-2.5 rounded transition-all shadow-sm"
                                    >
                                      <FiSettings className="text-xs" />
                                      <span>{showRuleBuilder === campaign.id ? "Hide Rules" : "⚙️ Guardrails"}</span>
                                    </button>
                                    <button
                                      onClick={() => handleGenerateABVariants(campaign.id)}
                                      disabled={generatingVariants}
                                      className="flex items-center gap-1 bg-[#2e3e48] hover:bg-gray-800 disabled:opacity-50 text-white font-bold text-[10px] py-1 px-2.5 rounded transition-all shadow-sm"
                                    >
                                      Regenerate AI Variants
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Glowing Notification Alert Overlays */}
                              {ruleNotification && ruleNotification.campaignId === campaign.id && (
                                <div className={`p-3.5 rounded-xl border flex gap-3 items-center justify-between shadow-lg animate-fadeIn ${
                                  ruleNotification.type === "pause" 
                                    ? "bg-red-500/10 border-red-500/30 text-red-800" 
                                    : "bg-yellow-500/10 border-yellow-500/30 text-yellow-800"
                                }`}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{ruleNotification.type === "pause" ? "🔴" : "🏆"}</span>
                                    <p className="text-[11px] font-bold leading-normal">{ruleNotification.message}</p>
                                  </div>
                                  <button 
                                    onClick={() => setRuleNotification(null)}
                                    className="text-[10px] font-bold hover:underline shrink-0"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              )}

                              {/* Collapsible Rules Settings Panel */}
                              {showRuleBuilder === campaign.id && (
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm animate-fadeIn">
                                  <div className="flex justify-between items-center border-b pb-2">
                                    <h5 className="font-bold text-xs text-[#2e3e48] uppercase tracking-wider flex items-center gap-1.5">
                                      <FiSettings className="text-gray-400" />
                                      Automated Rule Configuration &amp; Guardrails
                                    </h5>
                                    <span className="text-[10px] bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
                                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-ping"></span>
                                      Guardrails Active
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    
                                    {/* Column 1: Underperformance Guardrail */}
                                    <div className="bg-white p-3 rounded-lg border border-gray-100 space-y-3 shadow-inner">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                          <FiAlertTriangle className="text-red-500 text-sm" />
                                          ROAS Auto-Pause Guardrail
                                        </span>
                                        <input
                                          type="checkbox"
                                          checked={activeRules[campaign.id]?.roasGuardrailEnabled || false}
                                          onChange={(e) => handleSaveRulesConfig(campaign.id, {
                                            ...activeRules[campaign.id],
                                            roasGuardrailEnabled: e.target.checked
                                          })}
                                          className="w-4 h-4 accent-[#2e3e48] cursor-pointer"
                                        />
                                      </div>
                                      <p className="text-[10px] text-gray-400">Automatically pause variations when their return on ad spend drops below limits.</p>
                                      
                                      {activeRules[campaign.id]?.roasGuardrailEnabled && (
                                        <div className="space-y-3 pt-2 border-t border-gray-50 animate-fadeIn">
                                          
                                          {/* Slider 1: Min ROAS */}
                                          <div className="space-y-1">
                                            <div className="flex justify-between text-[10px]">
                                              <span className="text-gray-500">Minimum ROAS Boundary</span>
                                              <span className="font-bold text-[#2e3e48] font-mono">{activeRules[campaign.id]?.roasMinLimit.toFixed(1)}x</span>
                                            </div>
                                            <input
                                              type="range"
                                              min={1.0}
                                              max={3.0}
                                              step={0.1}
                                              value={activeRules[campaign.id]?.roasMinLimit || 1.5}
                                              onChange={(e) => setActiveRules(prev => ({
                                                ...prev,
                                                [campaign.id]: { ...prev[campaign.id], roasMinLimit: Number(e.target.value) }
                                              }))}
                                              onMouseUp={(e: any) => handleSaveRulesConfig(campaign.id, {
                                                ...activeRules[campaign.id],
                                                roasMinLimit: Number(e.target.value)
                                              })}
                                              className="w-full h-1 bg-gray-100 rounded accent-[#2e3e48]"
                                            />
                                          </div>

                                          {/* Slider 2: Spend Threshold */}
                                          <div className="space-y-1">
                                            <div className="flex justify-between text-[10px]">
                                              <span className="text-gray-500">Spend Threshold Needed</span>
                                              <span className="font-bold text-[#2e3e48] font-mono">${activeRules[campaign.id]?.roasSpendThreshold}</span>
                                            </div>
                                            <input
                                              type="range"
                                              min={25}
                                              max={500}
                                              step={25}
                                              value={activeRules[campaign.id]?.roasSpendThreshold || 100}
                                              onChange={(e) => setActiveRules(prev => ({
                                                ...prev,
                                                [campaign.id]: { ...prev[campaign.id], roasSpendThreshold: Number(e.target.value) }
                                              }))}
                                              onMouseUp={(e: any) => handleSaveRulesConfig(campaign.id, {
                                                ...activeRules[campaign.id],
                                                roasSpendThreshold: Number(e.target.value)
                                              })}
                                              className="w-full h-1 bg-gray-100 rounded accent-[#2e3e48]"
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Column 2: Winner Auto-Trigger */}
                                    <div className="bg-white p-3 rounded-lg border border-gray-100 space-y-3 shadow-inner">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                          <FiTrendingUp className="text-green-600 text-sm" />
                                          Winner Auto-Promotion
                                        </span>
                                        <input
                                          type="checkbox"
                                          checked={activeRules[campaign.id]?.winnerAutoEnabled || false}
                                          onChange={(e) => handleSaveRulesConfig(campaign.id, {
                                            ...activeRules[campaign.id],
                                            winnerAutoEnabled: e.target.checked
                                          })}
                                          className="w-4 h-4 accent-[#2e3e48] cursor-pointer"
                                        />
                                      </div>
                                      <p className="text-[10px] text-gray-400">Auto-promote and set variant as winner when it outperforms others by a set margin.</p>
                                      
                                      {activeRules[campaign.id]?.winnerAutoEnabled && (
                                        <div className="space-y-3 pt-2 border-t border-gray-50 animate-fadeIn">
                                          
                                          {/* Slider 1: Uplift margin */}
                                          <div className="space-y-1">
                                            <div className="flex justify-between text-[10px]">
                                              <span className="text-gray-500">Winner ROAS Uplift Margin</span>
                                              <span className="font-bold text-[#2e3e48] font-mono">{activeRules[campaign.id]?.winnerMinRoasUplift}%</span>
                                            </div>
                                            <input
                                              type="range"
                                              min={10}
                                              max={50}
                                              step={5}
                                              value={activeRules[campaign.id]?.winnerMinRoasUplift || 25}
                                              onChange={(e) => setActiveRules(prev => ({
                                                ...prev,
                                                [campaign.id]: { ...prev[campaign.id], winnerMinRoasUplift: Number(e.target.value) }
                                              }))}
                                              onMouseUp={(e: any) => handleSaveRulesConfig(campaign.id, {
                                                ...activeRules[campaign.id],
                                                winnerMinRoasUplift: Number(e.target.value)
                                              })}
                                              className="w-full h-1 bg-gray-100 rounded accent-[#2e3e48]"
                                            />
                                          </div>

                                          {/* Slider 2: Clicks Needed */}
                                          <div className="space-y-1">
                                            <div className="flex justify-between text-[10px]">
                                              <span className="text-gray-500">Minimum Clicks Required</span>
                                              <span className="font-bold text-[#2e3e48] font-mono">{activeRules[campaign.id]?.winnerClickThreshold} clicks</span>
                                            </div>
                                            <input
                                              type="range"
                                              min={50}
                                              max={500}
                                              step={25}
                                              value={activeRules[campaign.id]?.winnerClickThreshold || 200}
                                              onChange={(e) => setActiveRules(prev => ({
                                                ...prev,
                                                [campaign.id]: { ...prev[campaign.id], winnerClickThreshold: Number(e.target.value) }
                                              }))}
                                              onMouseUp={(e: any) => handleSaveRulesConfig(campaign.id, {
                                                ...activeRules[campaign.id],
                                                winnerClickThreshold: Number(e.target.value)
                                              })}
                                              className="w-full h-1 bg-gray-100 rounded accent-[#2e3e48]"
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                  </div>

                                  {/* Rule Evaluation Logs Audit Trail */}
                                  <div className="bg-gray-900 text-gray-300 rounded-lg p-3 border border-white/5 space-y-1.5 max-h-[130px] overflow-y-auto font-mono text-[9px] no-scrollbar">
                                    <div className="flex items-center gap-1.5 border-b border-white/5 pb-1 mb-1 text-gray-400 font-bold justify-between">
                                      <span className="flex items-center gap-1 uppercase tracking-wider text-[8px] flex-row">
                                        <FiList className="text-[10px] inline-block mr-1" />
                                        Automation Rule Engine Activity Logs
                                      </span>
                                      <span className="text-[7px] text-[#CAF389]">ACTIVE POLLING</span>
                                    </div>
                                    {(!ruleLogs[campaign.id] || ruleLogs[campaign.id].length === 0) ? (
                                      <p className="text-gray-500 italic">Evaluating metrics... awaiting rules scan.</p>
                                    ) : (
                                      ruleLogs[campaign.id].map((log, lidx) => (
                                        <div key={lidx} className="flex gap-2">
                                          <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
                                          <span className={`${
                                            log.type === "success" ? "text-emerald-400 font-semibold" :
                                            log.type === "warning" ? "text-amber-400 font-semibold" :
                                            log.type === "error" ? "text-red-400 font-semibold" :
                                            "text-gray-300"
                                          }`}>
                                            {log.message}
                                          </span>
                                        </div>
                                      ))
                                    )}
                                  </div>

                                </div>
                              )}

                              {/* Smart marketer recommendation banner */}
                              {(() => {
                                const activeVars = variants.filter(v => v.is_active);
                                if (activeVars.length >= 2) {
                                  const roas1 = activeVars[0].spent > 0 ? activeVars[0].revenue / activeVars[0].spent : 0;
                                  const roas2 = activeVars[1].spent > 0 ? activeVars[1].revenue / activeVars[1].spent : 0;
                                  if (Math.abs(roas1 - roas2) > 0.05) {
                                    const leadVar = roas1 > roas2 ? activeVars[0] : activeVars[1];
                                    const percentageDiff = Math.round((Math.max(roas1, roas2) / Math.max(0.1, Math.min(roas1, roas2)) - 1) * 100);
                                    if (percentageDiff > 5) {
                                      return (
                                        <div className="bg-gradient-to-r from-green-50 to-[#caf389]/20 p-3 rounded-lg border border-[#caf389]/50 text-xs flex flex-row items-center gap-2 justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="text-base">💡</span>
                                            <p className="text-green-800 font-semibold leading-snug">
                                              Smart Suggestion: <strong className="font-bold">{leadVar.name}</strong> is leading with a <strong className="font-bold">{percentageDiff}% higher ROAS</strong>. Declare it as winner to promote it!
                                            </p>
                                          </div>
                                          <button
                                            onClick={() => handleDeclareWinner(campaign.id, leadVar.id)}
                                            disabled={declaringWinnerId === leadVar.id}
                                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-[10px] shrink-0"
                                          >
                                            {declaringWinnerId === leadVar.id ? "Promoting..." : "Auto-Promote"}
                                          </button>
                                        </div>
                                      );
                                    }
                                  }
                                }
                                return null;
                              })()}

                              {/* Side-by-Side Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {variants.map((v, idx) => {
                                  const roas = v.spent > 0 ? (v.revenue / v.spent) : 0.0;
                                  
                                  const otherActive = variants.find(ov => ov.id !== v.id && ov.is_active);
                                  const otherRoas = otherActive && otherActive.spent > 0 ? (otherActive.revenue / otherActive.spent) : 0.0;
                                  const isLeading = v.is_active && roas > otherRoas && roas > 0;

                                  return (
                                    <div 
                                      key={v.id} 
                                      className={`flex flex-col rounded-xl border p-4 bg-white transition-all shadow-sm ${
                                        v.is_winner 
                                          ? "border-green-400 ring-2 ring-green-100" 
                                          : isLeading 
                                            ? "border-[#caf389] shadow-md ring-2 ring-[#caf389]/10" 
                                            : "border-gray-200"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-3 border-b pb-2">
                                        <div className="flex flex-col">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-gray-800 text-sm">{v.name}</span>
                                            {v.is_winner && (
                                              <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                                                <FiAward /> WINNER
                                              </span>
                                            )}
                                            {!v.is_winner && isLeading && (
                                              <span className="text-[9px] bg-[#caf389] text-[#2e3e48] px-1.5 py-0.5 rounded-full font-bold">
                                                ★ LEADING
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[10px] text-gray-400">Created: {new Date(v.created_at).toLocaleDateString()}</span>
                                        </div>

                                        {!v.is_winner && (
                                          <button
                                            onClick={() => handleToggleVariantStatus(campaign.id, v.id, v.is_active)}
                                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase transition-colors ${
                                              v.is_active 
                                                ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200" 
                                                : "bg-gray-100 text-gray-400 hover:bg-gray-200 border border-gray-200"
                                            }`}
                                          >
                                            {v.is_active ? "Active" : "Paused"}
                                          </button>
                                        )}
                                      </div>

                                      <div className="flex gap-3 text-xs mb-4">
                                        {v.ad_creative_url && (
                                          <div className="w-[80px] h-[80px] rounded border overflow-hidden shrink-0 shadow-sm bg-gray-50">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={v.ad_creative_url} alt="variant creative" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                          </div>
                                        )}
                                        <div className="flex-1 bg-gray-50 p-2.5 rounded border border-gray-100 max-h-[80px] overflow-y-auto no-scrollbar">
                                          <p className="italic text-gray-600 leading-normal text-[11px] whitespace-pre-wrap">&quot;{v.ad_copy}&quot;</p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                          <div className="text-[10px] text-gray-400 uppercase font-semibold">Spent</div>
                                          <div className="font-bold text-[#2e3e48]">${v.spent?.toFixed(2) || "0.00"}</div>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                          <div className="text-[10px] text-gray-400 uppercase font-semibold">Revenue</div>
                                          <div className="font-bold text-green-600">${v.revenue?.toFixed(2) || "0.00"}</div>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                          <div className="text-[10px] text-gray-400 uppercase font-semibold">Clicks</div>
                                          <div className="font-bold text-[#2e3e48]">{v.clicks?.toLocaleString() || 0}</div>
                                        </div>
                                        <div className={`p-2 rounded border transition-colors ${
                                          isLeading 
                                            ? "bg-green-50/50 border-green-200" 
                                            : "bg-gray-50 border-gray-100"
                                        }`}>
                                          <div className="text-[10px] text-gray-400 uppercase font-semibold">ROAS</div>
                                          <div className={`font-bold text-sm ${isLeading ? "text-green-600" : "text-gray-800"}`}>
                                            {roas.toFixed(2)}x
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-2 mt-auto">
                                        <div>
                                          <div className="flex justify-between text-[9px] text-gray-500 font-bold mb-0.5">
                                            <span>ROAS PROGRESS</span>
                                            <span>{roas.toFixed(1)}x</span>
                                          </div>
                                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                              className={`h-full rounded-full transition-all duration-500 ${
                                                v.is_winner 
                                                  ? "bg-green-500" 
                                                  : isLeading 
                                                    ? "bg-[#caf389]" 
                                                    : "bg-gray-400"
                                              }`}
                                              style={{ width: `${Math.min(100, (roas / 4) * 100)}%` }}
                                            />
                                          </div>
                                        </div>

                                        {!v.is_winner && v.is_active && (
                                          <button
                                            onClick={() => handleDeclareWinner(campaign.id, v.id)}
                                            disabled={declaringWinnerId !== null}
                                            className="w-full mt-2 py-1.5 bg-gradient-to-r from-[#2e3e48] to-[#1C282F] hover:from-[#1C282F] hover:to-[#0D161A] text-white rounded font-bold text-[10px] flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                          >
                                            <FiAward />
                                            {declaringWinnerId === v.id ? "Declaring Winner..." : "Declare as Winner & Promote"}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
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
