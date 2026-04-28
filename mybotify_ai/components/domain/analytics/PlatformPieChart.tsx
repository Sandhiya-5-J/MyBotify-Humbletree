"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Campaign {
  platform: string;
}

interface PlatformPieChartProps {
  campaigns: Campaign[];
}

const PLATFORM_COLORS: Record<string, string> = {
  Facebook: "#1877F2",
  Instagram: "#E4405F",
  "Google Ads": "#FBBC05",
  Other: "#9CA3AF",
};

function prepareData(campaigns: Campaign[]) {
  if (campaigns && campaigns.length > 0) {
    const counts: Record<string, number> = {};
    campaigns.forEach((c) => {
      const p = c.platform || "Other";
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }

  // Demo data
  return [
    { name: "Facebook", value: 5 },
    { name: "Instagram", value: 3 },
    { name: "Google Ads", value: 2 },
  ];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#2e3e48] text-white px-3 py-2 rounded-lg shadow-lg text-sm">
        <p className="font-medium">
          {payload[0].name}: {payload[0].value} campaigns
        </p>
      </div>
    );
  }
  return null;
};

export default function PlatformPieChart({ campaigns }: PlatformPieChartProps) {
  const data = prepareData(campaigns);
  const hasRealData = campaigns && campaigns.length > 0;

  return (
    <div className="chart-card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#2e3e48]">
          Platform Distribution
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {hasRealData
            ? "Campaigns by platform"
            : "Sample distribution"}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={PLATFORM_COLORS[entry.name] || PLATFORM_COLORS.Other}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  PLATFORM_COLORS[item.name] || PLATFORM_COLORS.Other,
              }}
            />
            <span className="text-xs text-gray-600 font-medium">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
