/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { getAllUsers } from "@/api/admin";
import { FaUsers, FaUserShield, FaUserCheck, FaUserClock } from "react-icons/fa";

export default function AdminStats() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllUsers()
            .then((data) => setUsers(data || []))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading stats...</p>
            </div>
        );
    }

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.is_active).length;
    const adminUsers = users.filter((u) => u.role === "admin").length;

    // Users created in the last 7 days
    const recentSignups = users.filter((u) => {
        const created = new Date(u.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created >= weekAgo;
    }).length;

    const stats = [
        {
            label: "Total Users",
            value: totalUsers,
            icon: <FaUsers className="text-2xl" />,
            color: "bg-blue-50 text-blue-600",
            border: "border-blue-200",
        },
        {
            label: "Active Users",
            value: activeUsers,
            icon: <FaUserCheck className="text-2xl" />,
            color: "bg-green-50 text-green-600",
            border: "border-green-200",
        },
        {
            label: "Admins",
            value: adminUsers,
            icon: <FaUserShield className="text-2xl" />,
            color: "bg-purple-50 text-purple-600",
            border: "border-purple-200",
        },
        {
            label: "Recent Signups (7d)",
            value: recentSignups,
            icon: <FaUserClock className="text-2xl" />,
            color: "bg-amber-50 text-amber-600",
            border: "border-amber-200",
        },
    ];

    return (
        <div>
            <h2 className="text-xl font-bold text-[#2E3E48] mb-6">
                Admin Dashboard
            </h2>
            <div className="grid grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className={`bg-white rounded-xl border ${stat.border} p-5 shadow-sm`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`${stat.color} p-2 rounded-lg`}>{stat.icon}</div>
                        </div>
                        <p className="text-3xl font-bold text-[#2E3E48]">{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
