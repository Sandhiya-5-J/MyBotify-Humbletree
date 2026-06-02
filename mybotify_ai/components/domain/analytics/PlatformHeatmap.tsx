"use client";

import { useState, useEffect } from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { SiGoogleads } from "react-icons/si";

interface HeatmapCell {
  platform: string;
  timeBlock: string;
  intensity: "low" | "medium" | "high" | "peak";
  clicks: number;
  ctr: number;
  conversions: number;
  spend: number;
  revenue: number;
  roas: number;
}

const timeBlocks = [
  "12am-3am",
  "3am-6am",
  "6am-9am",
  "9am-12pm",
  "12pm-3pm",
  "3pm-6pm",
  "6pm-9pm",
  "9pm-12am",
];

const platforms = ["Facebook", "Instagram", "Google Ads"];

// Curated realistic performance data representing peak shopping hours
const heatmapData: HeatmapCell[] = [
  // --- Facebook ---
  { platform: "Facebook", timeBlock: "12am-3am", intensity: "low", clicks: 124, ctr: 1.1, conversions: 2, spend: 99.20, revenue: 140.00, roas: 1.41 },
  { platform: "Facebook", timeBlock: "3am-6am", intensity: "low", clicks: 42, ctr: 0.9, conversions: 0, spend: 33.60, revenue: 0.00, roas: 0.0 },
  { platform: "Facebook", timeBlock: "6am-9am", intensity: "medium", clicks: 310, ctr: 1.6, conversions: 8, spend: 248.00, revenue: 496.00, roas: 2.0 },
  { platform: "Facebook", timeBlock: "9am-12pm", intensity: "medium", clicks: 440, ctr: 1.8, conversions: 12, spend: 352.00, revenue: 774.40, roas: 2.2 },
  { platform: "Facebook", timeBlock: "12pm-3pm", intensity: "high", clicks: 680, ctr: 2.1, conversions: 22, spend: 544.00, revenue: 1360.00, roas: 2.5 },
  { platform: "Facebook", timeBlock: "3pm-6pm", intensity: "high", clicks: 750, ctr: 2.3, conversions: 26, spend: 600.00, revenue: 1680.00, roas: 2.8 },
  { platform: "Facebook", timeBlock: "6pm-9pm", intensity: "peak", clicks: 1200, ctr: 2.9, conversions: 48, spend: 960.00, revenue: 3168.00, roas: 3.3 },
  { platform: "Facebook", timeBlock: "9pm-12am", intensity: "peak", clicks: 980, ctr: 2.7, conversions: 38, spend: 784.00, revenue: 2430.40, roas: 3.1 },

  // --- Instagram ---
  { platform: "Instagram", timeBlock: "12am-3am", intensity: "medium", clicks: 210, ctr: 1.4, conversions: 5, spend: 168.00, revenue: 302.40, roas: 1.8 },
  { platform: "Instagram", timeBlock: "3am-6am", intensity: "low", clicks: 68, ctr: 1.1, conversions: 1, spend: 54.40, revenue: 65.28, roas: 1.2 },
  { platform: "Instagram", timeBlock: "6am-9am", intensity: "medium", clicks: 280, ctr: 1.7, conversions: 7, spend: 224.00, revenue: 470.40, roas: 2.1 },
  { platform: "Instagram", timeBlock: "9am-12pm", intensity: "medium", clicks: 390, ctr: 1.9, conversions: 11, spend: 312.00, revenue: 717.60, roas: 2.3 },
  { platform: "Instagram", timeBlock: "12pm-3pm", intensity: "high", clicks: 710, ctr: 2.4, conversions: 24, spend: 568.00, revenue: 1476.80, roas: 2.6 },
  { platform: "Instagram", timeBlock: "3pm-6pm", intensity: "peak", clicks: 1050, ctr: 2.8, conversions: 38, spend: 840.00, revenue: 2688.00, roas: 3.2 },
  { platform: "Instagram", timeBlock: "6pm-9pm", intensity: "peak", clicks: 1140, ctr: 3.1, conversions: 44, spend: 912.00, revenue: 3192.00, roas: 3.5 },
  { platform: "Instagram", timeBlock: "9pm-12am", intensity: "high", clicks: 880, ctr: 2.6, conversions: 29, spend: 704.00, revenue: 1971.20, roas: 2.8 },

  // --- Google Ads ---
  { platform: "Google Ads", timeBlock: "12am-3am", intensity: "low", clicks: 85, ctr: 0.9, conversions: 1, spend: 76.50, revenue: 91.80, roas: 1.2 },
  { platform: "Google Ads", timeBlock: "3am-6am", intensity: "low", clicks: 52, ctr: 0.8, conversions: 0, spend: 46.80, revenue: 0.00, roas: 0.0 },
  { platform: "Google Ads", timeBlock: "6am-9am", intensity: "high", clicks: 510, ctr: 2.2, conversions: 18, spend: 459.00, revenue: 1147.50, roas: 2.5 },
  { platform: "Google Ads", timeBlock: "9am-12pm", intensity: "peak", clicks: 890, ctr: 2.6, conversions: 34, spend: 801.00, revenue: 2483.10, roas: 3.1 },
  { platform: "Google Ads", timeBlock: "12pm-3pm", intensity: "peak", clicks: 920, ctr: 2.8, conversions: 36, spend: 828.00, revenue: 2649.60, roas: 3.2 },
  { platform: "Google Ads", timeBlock: "3pm-6pm", intensity: "high", clicks: 730, ctr: 2.4, conversions: 25, spend: 657.00, revenue: 1839.60, roas: 2.8 },
  { platform: "Google Ads", timeBlock: "6pm-9pm", intensity: "medium", clicks: 420, ctr: 1.8, conversions: 12, spend: 378.00, revenue: 831.60, roas: 2.2 },
  { platform: "Google Ads", timeBlock: "9pm-12am", intensity: "medium", clicks: 310, ctr: 1.5, conversions: 8, spend: 279.00, revenue: 530.10, roas: 1.9 },
];

export default function PlatformHeatmap() {
  const [mounted, setMounted] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const getCellColor = (intensity: HeatmapCell["intensity"]) => {
    switch (intensity) {
      case "low":
        return "bg-[#CAF389]/10 hover:bg-[#CAF389]/25 border-gray-100/50";
      case "medium":
        return "bg-[#CAF389]/35 hover:bg-[#CAF389]/50 border-gray-200/50";
      case "high":
        return "bg-[#CAF389]/65 hover:bg-[#CAF389]/75 border-gray-300/50";
      case "peak":
        return "bg-[#CAF389]/90 hover:bg-[#CAF389] border-gray-400/50 shadow-sm shadow-[#CAF389]/10";
      default:
        return "bg-[#CAF389]/5";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Facebook":
        return <FaFacebook className="text-[#3b5998]" />;
      case "Instagram":
        return <FaInstagram className="text-[#e1306c]" />;
      case "Google Ads":
        return <SiGoogleads className="text-[#4285f4]" />;
      default:
        return null;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Offset relative to the cursor
    setTooltipPos({
      x: e.clientX + 15,
      y: e.clientY + 15,
    });
  };

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm min-h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#CAF389] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-5 gap-2">
        <div>
          <h3 className="text-base font-bold text-[#2e3e48]">Platform Performance Heatmap</h3>
          <p className="text-xs text-gray-400 mt-0.5">Peak shopping hourly conversion densities across active channels</p>
        </div>
        
        {/* Heatmap Legend */}
        <div className="flex items-center gap-3 text-[10px] text-gray-400">
          <span>Low Traffic</span>
          <div className="flex gap-1">
            <span className="w-3.5 h-3.5 rounded bg-[#CAF389]/10 border border-gray-200" />
            <span className="w-3.5 h-3.5 rounded bg-[#CAF389]/35 border border-gray-200" />
            <span className="w-3.5 h-3.5 rounded bg-[#CAF389]/65 border border-gray-200" />
            <span className="w-3.5 h-3.5 rounded bg-[#CAF389]/90 border border-gray-200" />
          </div>
          <span>Peak Orders</span>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-[700px] space-y-4">
          
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-1">
            <div className="col-span-3 text-left">Platform</div>
            {timeBlocks.map((block, idx) => (
              <div key={idx} className="col-span-1">{block}</div>
            ))}
          </div>

          {/* Platform Rows */}
          {platforms.map((platform) => {
            const platformCells = heatmapData.filter((cell) => cell.platform === platform);
            
            return (
              <div key={platform} className="grid grid-cols-12 gap-2 items-center">
                
                {/* Platform Label */}
                <div className="col-span-3 flex items-center gap-2 text-sm font-bold text-[#2e3e48]">
                  <span className="text-base">{getPlatformIcon(platform)}</span>
                  <span>{platform}</span>
                </div>

                {/* Heatmap Blocks */}
                {timeBlocks.map((block) => {
                  const cell = platformCells.find((c) => c.timeBlock === block);
                  if (!cell) return <div key={block} className="col-span-1 bg-gray-50 h-10 rounded border border-gray-100" />;
                  
                  return (
                    <div
                      key={block}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      onMouseMove={handleMouseMove}
                      className={`col-span-1 h-11 rounded-lg border transition-all duration-200 cursor-help ${getCellColor(cell.intensity)}`}
                    />
                  );
                })}

              </div>
            );
          })}

        </div>
      </div>

      {/* Floating Hover Tooltip Portal Card */}
      {hoveredCell && (
        <div
          style={{
            position: "fixed",
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            zIndex: 9999,
          }}
          className="bg-[#2e3e48] border border-white/10 text-white rounded-xl p-3.5 shadow-2xl space-y-2 pointer-events-none w-52 animate-fadeIn"
        >
          <div className="flex justify-between items-center border-b border-white/5 pb-1.5 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span>{getPlatformIcon(hoveredCell.platform)}</span>
              <span className="font-bold text-xs">{hoveredCell.platform}</span>
            </div>
            <span className="text-[9px] font-bold bg-[#CAF389]/10 text-[#CAF389] px-1.5 py-0.5 rounded uppercase">
              {hoveredCell.timeBlock}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-gray-300">
            <div>
              <span className="text-gray-400 block">Spend:</span>
              <span className="font-bold font-mono text-white">${hoveredCell.spend.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Gross Rev:</span>
              <span className="font-bold font-mono text-green-400">${hoveredCell.revenue.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Clicks (CTR):</span>
              <span className="font-bold font-mono text-white">{hoveredCell.clicks} ({hoveredCell.ctr}%)</span>
            </div>
            <div>
              <span className="text-gray-400 block">Conversions:</span>
              <span className="font-bold font-mono text-white">{hoveredCell.conversions} orders</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-white/5 flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Projected ROAS:</span>
            <span className={`font-bold font-mono ${hoveredCell.roas >= 2.5 ? "text-[#CAF389]" : "text-white"}`}>
              {hoveredCell.roas.toFixed(2)}x
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
