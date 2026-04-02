/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { getAllStores, disconnectStore } from "@/api/store";

export default function StoresTable() {
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");

    const fetchStores = () => {
        setLoading(true);
        getAllStores()
            .then((data) => setStores(data || []))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const handleDisconnect = async (storeId: number) => {
        if (!confirm("Are you sure you want to disconnect this store?")) return;
        try {
            await disconnectStore(storeId);
            fetchStores();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const filteredStores = stores.filter(
        (s) =>
            s.store_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
            s.store_url?.toLowerCase().includes(searchValue.toLowerCase()) ||
            s.shopify_email?.toLowerCase().includes(searchValue.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading stores...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#2E3E48]">
                    Connected Stores ({stores.length})
                </h2>
                <input
                    type="text"
                    placeholder="Search stores..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm w-64"
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-[#2e3e48] text-white">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Store Name</th>
                            <th className="px-4 py-3 text-left font-medium">URL</th>
                            <th className="px-4 py-3 text-left font-medium">Owner (User ID)</th>
                            <th className="px-4 py-3 text-left font-medium">Plan</th>
                            <th className="px-4 py-3 text-left font-medium">Country</th>
                            <th className="px-4 py-3 text-left font-medium">Connected</th>
                            <th className="px-4 py-3 text-center font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStores.map((store, idx) => (
                            <tr
                                key={store.id}
                                className={`border-b border-gray-100 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    } hover:bg-[#f8fdf0] transition-colors`}
                            >
                                <td className="px-4 py-3 font-medium text-[#2E3E48]">
                                    {store.store_name}
                                </td>
                                <td className="px-4 py-3 text-gray-600 text-xs">
                                    {store.store_url}
                                </td>
                                <td className="px-4 py-3 text-gray-600">{store.user_id}</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                                        {store.shopify_plan || "N/A"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {store.country || "N/A"}
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                    {new Date(store.connected_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => handleDisconnect(store.id)}
                                        className="px-3 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                    >
                                        Disconnect
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredStores.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                        No stores connected yet
                    </div>
                )}
            </div>
        </div>
    );
}
