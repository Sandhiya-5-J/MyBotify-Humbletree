/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

type Props = {
  data: any;
  currency: string;
};

export default function MarketAnalysis({ data, currency }: Props) {
  if (!data) return null;

  const fmt = (val: number) => `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={data.total_products} color="blue" />
        <StatCard label="Avg. Price" value={fmt(data.avg_price)} color="purple" />
        <StatCard label="Price Range" value={`${fmt(data.min_price)} – ${fmt(data.max_price)}`} color="orange" />
        <StatCard label="Total Inventory" value={data.total_inventory?.toLocaleString()} color="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Distribution */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h3 className="text-sm font-bold text-[#2E3E48] mb-4">💵 Price Distribution (USD)</h3>
          <div className="space-y-3">
            {Object.entries(data.price_distribution || {}).map(([range, count]: any) => {
              const total = data.total_products || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={range}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{range}</span>
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
        </div>

        {/* Product Categories */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h3 className="text-sm font-bold text-[#2E3E48] mb-4">📦 Product Categories</h3>
          {Object.keys(data.categories || {}).length > 0 ? (
            <div className="overflow-auto max-h-[250px]">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-gray-500 border-b">
                    <th className="text-left py-2 font-medium">Category</th>
                    <th className="text-right py-2 font-medium">Count</th>
                    <th className="text-right py-2 font-medium">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.categories)
                    .sort((a: any, b: any) => b[1].count - a[1].count)
                    .map(([cat, info]: any) => (
                      <tr key={cat} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 text-[#2E3E48] font-medium">{cat}</td>
                        <td className="py-2 text-right text-gray-600">{info.count}</td>
                        <td className="py-2 text-right text-gray-600">{fmt(info.total_value)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-400">No category data available</p>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl p-5 shadow-sm border">
        <h3 className="text-sm font-bold text-[#2E3E48] mb-4">🏆 Top Products by Price</h3>
        {data.top_products?.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="text-left py-2 font-medium">#</th>
                  <th className="text-left py-2 font-medium">Product</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-right py-2 font-medium">Price (USD)</th>
                  <th className="text-right py-2 font-medium">Inventory</th>
                </tr>
              </thead>
              <tbody>
                {data.top_products.map((p: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 text-gray-400">{i + 1}</td>
                    <td className="py-2 text-[#2E3E48] font-medium max-w-[250px] truncate">{p.title}</td>
                    <td className="py-2 text-gray-500">{p.type || "—"}</td>
                    <td className="py-2 text-right font-medium text-[#2E3E48]">{fmt(p.price)}</td>
                    <td className="py-2 text-right text-gray-500">{p.inventory ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-400">No products data. Upload a Products CSV to see analysis.</p>
        )}
      </div>

      {/* Low Inventory Alerts */}
      {data.low_inventory?.length > 0 && (
        <div className="bg-red-50 rounded-xl p-5 border border-red-200">
          <h3 className="text-sm font-bold text-red-700 mb-3">⚠️ Low Inventory Alerts (USA Stock)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.low_inventory.map((p: any, i: number) => (
              <div key={i} className="bg-white p-3 rounded-lg border border-red-100 flex justify-between items-center">
                <div>
                  <p className="text-xs font-medium text-[#2E3E48] truncate max-w-[180px]">{p.title}</p>
                  <p className="text-xs text-gray-500">{fmt(p.price || 0)}</p>
                </div>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">
                  {p.inventory} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USA Market Insight */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
        <h3 className="text-sm font-bold text-blue-800 mb-2">🇺🇸 USA Market Insight</h3>
        <div className="text-xs text-blue-700 space-y-1">
          <p>• Average product price ({fmt(data.avg_price)}) — {data.avg_price < 50 ? "competitive pricing for US impulse buyers" : data.avg_price < 100 ? "mid-range, target quality-conscious shoppers" : "premium segment, emphasize luxury & value"}</p>
          <p>• {data.total_inventory > 100 ? "Healthy inventory levels for US fulfillment" : "Consider restocking — low inventory may hurt US delivery times"}</p>
          <p>• {Object.keys(data.categories || {}).length} product categories — {Object.keys(data.categories || {}).length > 5 ? "diverse catalog, great for cross-selling" : "focused niche, build brand authority"}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: any; color: string }) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
  };
  return (
    <div className={`rounded-xl p-4 border ${colors[color]}`}>
      <p className="text-xs opacity-70 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
