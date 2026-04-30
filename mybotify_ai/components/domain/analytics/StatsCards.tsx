"use client";

import { useEffect, useState } from "react";
import {
  FaDollarSign,
  FaShoppingCart,
  FaBoxOpen,
  FaBullhorn,
} from "react-icons/fa";

interface StatsCardsProps {
  analytics: {
    sales_analysis?: {
      total_revenue?: number;
      total_orders?: number;
    };
    market_analysis?: {
      total_products?: number;
    };
  } | null;
  campaignCount: number;
}

interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
}

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString()}
    </span>
  );
}

export default function StatsCards({ analytics, campaignCount }: StatsCardsProps) {
  const stats: StatItem[] = [
    {
      label: "Total Revenue",
      value: `$${(analytics?.sales_analysis?.total_revenue || 0).toLocaleString()}`,
      icon: <FaDollarSign className="text-lg" />,
      gradient: "from-emerald-500 to-green-600",
      iconBg: "bg-emerald-100 text-emerald-600",
      change: "+12.5%",
      changeType: "up",
    },
    {
      label: "Total Orders",
      value: String(analytics?.sales_analysis?.total_orders || 0),
      icon: <FaShoppingCart className="text-lg" />,
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-100 text-blue-600",
      change: "+8.2%",
      changeType: "up",
    },
    {
      label: "Products",
      value: String(analytics?.market_analysis?.total_products || 0),
      icon: <FaBoxOpen className="text-lg" />,
      gradient: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-100 text-amber-600",
      change: "Active",
      changeType: "neutral",
    },
    {
      label: "Campaigns",
      value: String(campaignCount),
      icon: <FaBullhorn className="text-lg" />,
      gradient: "from-purple-500 to-pink-600",
      iconBg: "bg-purple-100 text-purple-600",
      change: "Running",
      changeType: "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="stat-card p-5 relative overflow-hidden animate-slide-up"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {/* Gradient accent top bar */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`}
          />

          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-[#2e3e48] mt-1">
                {stat.label === "Total Revenue" ? (
                  <AnimatedNumber
                    value={analytics?.sales_analysis?.total_revenue || 0}
                    prefix="$"
                  />
                ) : stat.label === "Total Orders" ? (
                  <AnimatedNumber value={analytics?.sales_analysis?.total_orders || 0} />
                ) : stat.label === "Products" ? (
                  <AnimatedNumber value={analytics?.market_analysis?.total_products || 0} />
                ) : (
                  <AnimatedNumber value={campaignCount} />
                )}
              </h3>
            </div>
            <div
              className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}
            >
              {stat.icon}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1">
            {stat.changeType === "up" && (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ↑ {stat.change}
              </span>
            )}
            {stat.changeType === "down" && (
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                ↓ {stat.change}
              </span>
            )}
            {stat.changeType === "neutral" && (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {stat.change}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
