"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  monthlyRevenue?: { month: string; revenue: number; orders: number }[];
}

function generateRevenueData(monthlyRevenue: RevenueChartProps["monthlyRevenue"]) {
  if (monthlyRevenue && monthlyRevenue.length > 0) {
    return monthlyRevenue.map((data) => ({
      date: data.month,
      revenue: Math.round(data.revenue),
    }));
  }

  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#2e3e48] text-white px-4 py-2 rounded-lg shadow-lg text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-[#CAF389] font-bold">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ monthlyRevenue }: RevenueChartProps) {
  const data = generateRevenueData(monthlyRevenue);
  const hasRealData = monthlyRevenue && monthlyRevenue.length > 0;

  return (
    <div className="chart-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#2e3e48]">Revenue Overview</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {hasRealData ? "Based on your monthly revenue" : "Awaiting data — upload orders to see real metrics"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#CAF389]" />
          <span className="text-xs text-gray-500">Revenue</span>
        </div>
      </div>

      {hasRealData ? (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={data}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#CAF389" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#CAF389" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#999" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#999" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#7CC832"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={{ r: 4, fill: "#7CC832", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#CAF389", stroke: "#2e3e48", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex flex-col items-center justify-center h-[280px] bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No revenue data available</p>
          <p className="text-sm text-gray-400 mt-1">Connect your store to see sales metrics</p>
        </div>
      )}
    </div>
  );
}
