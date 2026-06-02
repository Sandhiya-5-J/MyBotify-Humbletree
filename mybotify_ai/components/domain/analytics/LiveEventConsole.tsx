"use client";

import { useState, useEffect, useRef } from "react";
import { FiPlay, FiPause, FiTrash2, FiList, FiTrendingUp } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";

interface ConsoleLog {
  timestamp: string;
  category: "BUDGET" | "GUARDRAIL" | "EMAIL" | "ADS" | "SYSTEM";
  message: string;
  status: "info" | "success" | "warning" | "action";
}

const initialLogs: ConsoleLog[] = [
  { timestamp: "17:40:12", category: "SYSTEM", message: "MyBotify periodic scheduler sync active. Polling Shopify API...", status: "info" },
  { timestamp: "17:40:15", category: "BUDGET", message: "AI Budget Optimizer scanned ROAS trends. Shifted +$45.00 to 'Insta High-Intent Blast'.", status: "success" },
  { timestamp: "17:40:19", category: "GUARDRAIL", message: "Guardrails evaluated active A/B test variations: spent $185.00 across 2 copies. Monitoring.", status: "info" },
  { timestamp: "17:41:02", category: "EMAIL", message: "Customer segment VIP Cohort refreshed: identified +12 high-spending cart abandoners.", status: "info" },
  { timestamp: "17:41:04", category: "EMAIL", message: "Tailored promotional blast sequence auto-dispatched to VIP Churn Cohort.", status: "action" },
];

const mockEventBank: Omit<ConsoleLog, "timestamp">[] = [
  { category: "BUDGET", message: "AI Budget Optimizer reallocated $30.00 from low-conversion Facebook campaign to Google search ads.", status: "success" },
  { category: "GUARDRAIL", message: "Active ROAS check: Google Ads copy A ROAS rises (2.4x -> 2.8x). Threshold check complete.", status: "info" },
  { category: "GUARDRAIL", message: "Automated analysis: Variant B is within boundaries (spent $45.00, ROAS 1.9x). No action needed.", status: "info" },
  { category: "EMAIL", message: "Cart recovery sequence auto-triggered: Email 1 dispatched to 8 active abandoners.", status: "action" },
  { category: "EMAIL", message: "Promotional newsletter dispatched: successfully synced contact lists with Shopify Customers database.", status: "success" },
  { category: "ADS", message: "Meta Ads Platform API: synchronized overall click performance logs. Synced +410 clicks.", status: "info" },
  { category: "ADS", message: "Google Ads conversion tracking pixel verified. Conversions metrics synced successfully.", status: "success" },
  { category: "SYSTEM", message: "Periodic synchronization successfully updated analytics models in the database.", status: "success" },
  { category: "BUDGET", message: "ROAS optimization sweet-spot detected! meta ads CTR is 3.1%. Suggesting budget increment.", status: "info" },
  { category: "GUARDRAIL", message: "⚠️ Warning: Variant B spend exceeds $75.00 with ROAS of 1.1x. Nearing pause guardrail trigger.", status: "warning" },
];

export default function LiveEventConsole() {
  const [logs, setLogs] = useState<ConsoleLog[]>(initialLogs);
  const [isPaused, setIsPaused] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "BUDGET" | "GUARDRAIL" | "EMAIL" | "ADS">("ALL");
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Interval hook to simulate real-time operations logs
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const randomEvent = mockEventBank[Math.floor(Math.random() * mockEventBank.length)];
      const now = new Date();
      const timestamp = now.toTimeString().split(" ")[0]; // e.g. "17:45:02"
      
      setLogs((prev) => [
        ...prev,
        {
          timestamp,
          ...randomEvent,
        },
      ].slice(-50)); // cap history to last 50 logs
    }, 7000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Auto-scroll console window
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const handleClear = () => {
    setLogs([]);
  };

  const getCategoryBadgeColor = (category: ConsoleLog["category"]) => {
    switch (category) {
      case "SYSTEM":
        return "text-[#9ca3af] border-gray-700 bg-gray-900";
      case "BUDGET":
        return "text-[#CAF389] border-[#CAF389]/20 bg-[#CAF389]/5";
      case "GUARDRAIL":
        return "text-[#f87171] border-red-900/30 bg-red-950/20";
      case "EMAIL":
        return "text-[#6366f1] border-indigo-900/30 bg-indigo-950/20";
      case "ADS":
        return "text-[#60a5fa] border-blue-900/30 bg-blue-950/20";
      default:
        return "text-white border-white/10 bg-white/5";
    }
  };

  const getStatusColor = (status: ConsoleLog["status"]) => {
    switch (status) {
      case "success":
        return "text-emerald-400 font-semibold";
      case "warning":
        return "text-amber-400 font-semibold";
      case "action":
        return "text-[#CAF389] font-bold";
      default:
        return "text-gray-300";
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (activeFilter === "ALL") return true;
    return log.category === activeFilter;
  });

  return (
    <div className="bg-[#2e3e48] rounded-2xl p-6 text-white shadow-xl relative border border-white/5 overflow-hidden">
      
      {/* Premium glowing background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#CAF389]/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Header Deck */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-4 mb-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-[#131b1f] h-9 w-9 flex justify-center items-center rounded-lg border border-white/5 shadow-md shadow-black/10">
            <FiList className="text-[#CAF389] text-base" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Store Marketing Operations Console
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CAF389] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#CAF389]"></span>
              </span>
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Live monitoring AI automation triggers, ROAS logs, and customer dispatches</p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Pause Scroll Toggle */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-all font-semibold font-sans"
            title={isPaused ? "Resume log stream" : "Pause log stream"}
          >
            {isPaused ? (
              <>
                <FiPlay className="text-emerald-400" />
                Resume Stream
              </>
            ) : (
              <>
                <FiPause className="text-amber-400 animate-pulse" />
                Pause Stream
              </>
            )}
          </button>

          {/* Clear Console Logs */}
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-300 border border-white/5 transition-all font-semibold font-sans"
            title="Clear console window logs"
          >
            <FiTrash2 className="text-xs" />
            Clear
          </button>

        </div>
      </div>

      {/* Log Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["ALL", "BUDGET", "GUARDRAIL", "EMAIL", "ADS"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${
              activeFilter === filter
                ? "bg-[#CAF389] text-[#2e3e48] border-transparent shadow shadow-[#CAF389]/10"
                : "bg-[#131b1f] text-gray-400 border-white/5 hover:text-white"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Terminal Monospace Console Window */}
      <div className="bg-[#131b1f] border border-white/5 rounded-xl p-4 h-64 overflow-y-auto font-mono text-[10px] space-y-2.5 no-scrollbar shadow-inner relative flex flex-col justify-start select-text">
        
        {/* Empty State */}
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 italic">
            <HiOutlineSparkles className="text-2xl text-gray-600 mb-2 animate-pulse" />
            <span>No console events recorded in this category.</span>
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={idx} className="flex gap-2.5 items-start leading-relaxed animate-fadeIn">
              
              {/* Timestamp */}
              <span className="text-gray-500 font-bold shrink-0">[{log.timestamp}]</span>
              
              {/* Category Badge */}
              <span className={`px-2 py-0.5 rounded border text-[8px] font-bold shrink-0 ${getCategoryBadgeColor(log.category)}`}>
                {log.category}
              </span>

              {/* Log message */}
              <span className={`flex-1 ${getStatusColor(log.status)}`}>
                {log.message}
              </span>

            </div>
          ))
        )}

        {/* Scroll anchor */}
        <div ref={consoleEndRef} />
      </div>

    </div>
  );
}
