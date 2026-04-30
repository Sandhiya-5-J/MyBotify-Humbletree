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

  return [];
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
              : "Awaiting data — create campaigns to see real metrics"}
          </p>
        </div>
      </div>

      {hasRealData ? (
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
      ) : (
        <div className="flex flex-col items-center justify-center h-[280px] bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No campaign data available</p>
          <p className="text-sm text-gray-400 mt-1">Create a campaign to see performance metrics</p>
        </div>
      )}
    </div>
  );
}
