"use client";

interface Order {
  id: number;
  order_number?: string;
  customer_name?: string;
  total_price?: number;
  order_date?: string;
  status?: string;
}

interface RecentOrdersProps {
  orders: Order[];
}

const statusColors: Record<string, string> = {
  fulfilled: "bg-emerald-50 text-emerald-700",
  paid: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

function getDemoOrders(): Order[] {
  return [
    { id: 1, order_number: "#1042", customer_name: "Sarah Johnson", total_price: 89.99, order_date: "2024-06-15", status: "fulfilled" },
    { id: 2, order_number: "#1041", customer_name: "Mike Chen", total_price: 145.50, order_date: "2024-06-14", status: "paid" },
    { id: 3, order_number: "#1040", customer_name: "Emma Wilson", total_price: 32.00, order_date: "2024-06-14", status: "pending" },
    { id: 4, order_number: "#1039", customer_name: "James Brown", total_price: 210.00, order_date: "2024-06-13", status: "fulfilled" },
    { id: 5, order_number: "#1038", customer_name: "Lisa Park", total_price: 67.50, order_date: "2024-06-13", status: "fulfilled" },
  ];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const hasRealData = orders && orders.length > 0;
  const displayOrders = hasRealData ? orders.slice(0, 5) : getDemoOrders();

  return (
    <div className="chart-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-[#2e3e48]">Recent Orders</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {hasRealData ? "Latest 5 orders" : "Sample orders — upload order data to see real data"}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                Order
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                Customer
              </th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                Amount
              </th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {displayOrders.map((order, i) => (
              <tr
                key={order.id || i}
                className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-[#2e3e48]">
                  {order.order_number || `#${order.id}`}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {order.customer_name || "—"}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-[#2e3e48] text-right">
                  ${(order.total_price || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      statusColors[(order.status || "pending").toLowerCase()] ||
                      statusColors.pending
                    }`}
                  >
                    {order.status || "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
