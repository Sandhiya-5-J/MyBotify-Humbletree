/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

type Props = {
  data: any;
  currency: string;
};

export default function CustomerAnalysis({ data, currency }: Props) {
  if (!data || data.total_customers === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow-sm border">
        <p className="text-sm text-gray-500 mb-2">No customer data available.</p>
        <p className="text-xs text-gray-400">Upload a Customers CSV to see insights.</p>
      </div>
    );
  }

  const fmt = (val: number) => `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const optIn = data.marketing_opt_in?.subscribed || 0;
  const optOut = data.marketing_opt_in?.unsubscribed || 0;
  const totalMarketing = optIn + optOut || 1;
  const optInPct = Math.round((optIn / totalMarketing) * 100);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={data.total_customers} color="blue" />
        <StatCard label="Total Tracked Spend" value={fmt(data.total_spent)} color="green" />
        <StatCard label="Avg. Customer Value" value={fmt(data.avg_customer_spend)} color="emerald" />
        <StatCard label="Marketing Opt-in Rate" value={`${optInPct}%`} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marketing Status */}
        <div className="bg-white rounded-xl p-5 shadow-sm border flex flex-col justify-center">
          <h3 className="text-sm font-bold text-[#2E3E48] mb-4">📧 Email Marketing Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Subscribed</span>
                <span className="font-medium text-[#2E3E48]">{optIn} ({optInPct}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded h-3">
                <div className="bg-green-500 rounded h-3 transition-all" style={{ width: `${optInPct}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded-full">Not Subscribed</span>
                <span className="font-medium text-[#2E3E48]">{optOut} ({100 - optInPct}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded h-3">
                <div className="bg-gray-300 rounded h-3 transition-all" style={{ width: `${100 - optInPct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h3 className="text-sm font-bold text-[#2E3E48] mb-4">📍 Top Locations (State/Province)</h3>
          {data.top_locations?.length > 0 ? (
            <div className="overflow-auto max-h-[220px]">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-gray-500 border-b">
                    <th className="text-left py-2 font-medium">Location</th>
                    <th className="text-right py-2 font-medium">Customers</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_locations.map((loc: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 text-[#2E3E48] font-medium max-w-[200px] truncate">
                        {loc.location}
                      </td>
                      <td className="py-2 text-right text-gray-600 font-medium">{loc.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-400">No location data found in CSV.</p>
          )}
        </div>
      </div>

      {/* USA Market Insight */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
        <h3 className="text-sm font-bold text-purple-800 mb-2">🇺🇸 USA Audience Insight</h3>
        <div className="text-xs text-purple-700 space-y-1">
          <p>• Marketing Opt-in: {optInPct}% — {optInPct > 50 ? "Excellent list health! High potential for email retention campaigns in the US." : "Below average opt-in rate. Consider adding an exit-intent popup with a 10% discount to capture US shoppers."}</p>
          <p>• Average Customer Value: {fmt(data.avg_customer_spend)} — {data.avg_customer_spend > 100 ? "High value segment. Consider a VIP loyalty program." : "Focus on post-purchase flows to turn one-time US buyers into repeat customers."}</p>
          {data.top_locations?.length > 0 && (
            <p>• Top Geography: Your strongest presence is in <strong>{data.top_locations[0].location}</strong>. Consider geo-targeted Facebook/TikTok ads for similar audiences there.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: any; color: string }) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <div className={`rounded-xl p-4 border ${colors[color]}`}>
      <p className="text-xs opacity-70 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
