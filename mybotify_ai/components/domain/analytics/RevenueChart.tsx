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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orders: any[];
}

function generateRevenueData(orders: RevenueChartProps["orders"]) {
  // Group orders by date and sum revenue
  const revenueByDay: Record<string, number> = {};

  if (orders && orders.length > 0) {
    orders.forEach((order) => {
      const date = order.order_date
        ? new Date(order.order_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "Unknown";
      revenueByDay[date] =
        (revenueByDay[date] || 0) + (order.total_price || 0);
    });
  }

  // If we have real data, use it
  if (Object.keys(revenueByDay).length > 0) {
    return Object.entries(revenueByDay)
      .slice(-7)
      .map(([date, revenue]) => ({ date, revenue: Math.round(revenue) }));
  }

  // Demo data for empty states
  return [
    { date: "Mon", revenue: 1200 },
    { date: "Tue", revenue: 1900 },
    { date: "Wed", revenue: 1600 },
    { date: "Thu", revenue: 2400 },
    { date: "Fri", revenue: 2100 },
    { date: "Sat", revenue: 3200 },
    { date: "Sun", revenue: 2800 },
  ];
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

export default function RevenueChart({ orders }: RevenueChartProps) {
  const data = generateRevenueData(orders);
  const hasRealData = orders && orders.length > 0;

  return (
    <div className="chart-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#2e3e48]">Revenue Overview</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {hasRealData ? "Based on your order data" : "Sample data — upload orders to see real metrics"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#CAF389]" />
          <span className="text-xs text-gray-500">Revenue</span>
        </div>
      </div>

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
    </div>
  );
}
