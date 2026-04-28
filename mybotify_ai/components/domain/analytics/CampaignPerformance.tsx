"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Campaign {
  id: number;
  name: string;
  platform: string;
  spent: number;
  revenue: number;
  clicks: number;
  status: string;
}

interface CampaignPerformanceProps {
  campaigns: Campaign[];
}

function prepareData(campaigns: Campaign[]) {
  if (campaigns && campaigns.length > 0) {
    return campaigns.slice(0, 6).map((c) => ({
      name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
      spent: c.spent || 0,
      revenue: c.revenue || 0,
      clicks: c.clicks || 0,
    }));
  }

  // Demo data
  return [
    { name: "Summer Sale", spent: 450, revenue: 1200, clicks: 340 },
    { name: "New Launch", spent: 320, revenue: 980, clicks: 280 },
    { name: "Retargeting", spent: 280, revenue: 750, clicks: 190 },
    { name: "Brand Aware", spent: 600, revenue: 1500, clicks: 420 },
  ];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#2e3e48] text-white px-4 py-3 rounded-lg shadow-lg text-sm">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((item: { name: string; value: number; color: string }, i: number) => (
          <p key={i} style={{ color: item.color }} className="font-semibold">
            {item.name}: {item.name === "Revenue" || item.name === "Spent" ? "$" : ""}
            {item.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CampaignPerformance({ campaigns }: CampaignPerformanceProps) {
  const data = prepareData(campaigns);
  const hasRealData = campaigns && campaigns.length > 0;

  return (
    <div className="chart-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#2e3e48]">
            Campaign Performance
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {hasRealData
              ? "Spend vs Revenue per campaign"
              : "Sample data — create campaigns to see real metrics"}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#999" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#999" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
          />
          <Bar
            dataKey="revenue"
            name="Revenue"
            fill="#CAF389"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="spent"
            name="Spent"
            fill="#F59E0B"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="clicks"
            name="Clicks"
            fill="#60A5FA"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
