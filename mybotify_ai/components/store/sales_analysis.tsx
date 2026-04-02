/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

type Props = {
  data: any;
  currency: string;
};

export default function SalesAnalysis({ data, currency }: Props) {
  if (!data) return null;

  const fmt = (val: number) => `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statusColors: any = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    refunded: "bg-red-100 text-red-700",
    authorized: "bg-blue-100 text-blue-700",
    fulfilled: "bg-green-100 text-green-700",
    unfulfilled: "bg-orange-100 text-orange-700",
    partial: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={data.total_orders} color="green" />
        <StatCard label="Total Revenue" value={fmt(data.total_revenue)} color="emerald" />
        <StatCard label="Avg. Order Value" value={fmt(data.avg_order_value)} color="blue" />
        <StatCard label="Unique Customers" value={data.unique_customers} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Status */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h3 className="text-sm font-bold text-[#2E3E48] mb-4">💳 Payment Status</h3>
          {Object.keys(data.financial_status || {}).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(data.financial_status).map(([status, count]: any) => {
                const total = data.total_orders || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[status] || "bg-gray-100 text-gray-600"}`}>
                        {status}
                      </span>
                      <span className="font-medium text-[#2E3E48]">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded h-2.5">
                      <div
                        className="bg-green-500 rounded h-2.5 transition-all"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No payment data</p>
          )}
        </div>

        {/* Fulfillment Status */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h3 className="text-sm font-bold text-[#2E3E48] mb-4">📦 Fulfillment Status</h3>
          {Object.keys(data.fulfillment_status || {}).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(data.fulfillment_status).map(([status, count]: any) => {
                const total = data.total_orders || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[status] || "bg-gray-100 text-gray-600"}`}>
                        {status}
                      </span>
                      <span className="font-medium text-[#2E3E48]">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded h-2.5">
                      <div
                        className="bg-blue-500 rounded h-2.5 transition-all"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No fulfillment data</p>
          )}
        </div>
      </div>

      {/* Monthly Revenue */}
      <div className="bg-white rounded-xl p-5 shadow-sm border">
        <h3 className="text-sm font-bold text-[#2E3E48] mb-4">📈 Monthly Revenue (USD)</h3>
        {data.monthly_revenue?.length > 0 ? (
          <div className="space-y-2">
            {data.monthly_revenue.map((m: any) => {
              const maxRev = Math.max(...data.monthly_revenue.map((x: any) => x.revenue));
              const pct = maxRev > 0 ? Math.round((m.revenue / maxRev) * 100) : 0;
              return (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16 shrink-0">{m.month}</span>
                  <div className="flex-1 bg-gray-100 rounded h-6 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 rounded h-6 transition-all flex items-center"
                      style={{ width: `${pct}%` }}
                    >
                      <span className="text-xs text-white font-medium pl-2 whitespace-nowrap">
                        {fmt(m.revenue)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-20 text-right">{m.orders} orders</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No monthly data. Upload an Orders CSV to see trends.</p>
        )}
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-xl p-5 shadow-sm border">
        <h3 className="text-sm font-bold text-[#2E3E48] mb-4">👥 Top Customers by Spend</h3>
        {data.top_customers?.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="text-left py-2 font-medium">#</th>
                  <th className="text-left py-2 font-medium">Customer</th>
                  <th className="text-left py-2 font-medium">Email</th>
                  <th className="text-right py-2 font-medium">Orders</th>
                  <th className="text-right py-2 font-medium">Total Spend (USD)</th>
                </tr>
              </thead>
              <tbody>
                {data.top_customers.map((c: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 text-gray-400">{i + 1}</td>
                    <td className="py-2 text-[#2E3E48] font-medium">{c.name}</td>
                    <td className="py-2 text-gray-500">{c.email}</td>
                    <td className="py-2 text-right text-gray-600">{c.orders}</td>
                    <td className="py-2 text-right font-medium text-green-600">{fmt(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-400">No customer data. Upload an Orders CSV to see insights.</p>
        )}
      </div>

      {/* USA Market Performance */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
        <h3 className="text-sm font-bold text-green-800 mb-2">🇺🇸 USA Sales Performance</h3>
        <div className="text-xs text-green-700 space-y-1">
          <p>• Total revenue: {fmt(data.total_revenue)} from {data.total_orders} orders</p>
          <p>• Average order value: {fmt(data.avg_order_value)} — {data.avg_order_value > 75 ? "above US e-commerce average ($75), great performance!" : "below US e-commerce average ($75), consider upsell bundles"}</p>
          <p>• {data.unique_customers} unique customers — {data.total_orders > 0 ? `${(data.total_orders / data.unique_customers).toFixed(1)} orders per customer on average` : "no orders yet"}</p>
          {data.financial_status?.refunded > 0 && (
            <p>• ⚠️ {data.financial_status.refunded} refunded orders — review return reasons to reduce refund rate</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: any; color: string }) {
  const colors: any = {
    green: "bg-green-50 text-green-700 border-green-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <div className={`rounded-xl p-4 border ${colors[color]}`}>
      <p className="text-xs opacity-70 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
