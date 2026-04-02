/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getMyStores, disconnectStore } from "@/api/store";
import ConnectStoreModal from "../connect_store_modal";

export default function ContentAccount() {
  const [searchValue, setSearchValue] = useState("");
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnect, setShowConnect] = useState(false);
  const router = useRouter();

  const fetchStores = () => {
    setLoading(true);
    getMyStores()
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
      s.store_url?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const clickAccount = (domain: string) => {
    router.push(`/domain?domain=${encodeURIComponent(JSON.stringify(domain))}`);
  };

  return (
    <div className="w-[60%] h-full flex flex-col items-center overflow-auto no-scrollbar">
      <div className="w-60 h-60 ">
        <Image
          src="/account.svg"
          alt="Mybotify logo"
          width={300}
          height={300}
        />
      </div>
      <div>
        <div className="text-lg font-bold text-[#2E3E48] font-sans ">
          Connected Stores
        </div>
        <div className="text-xs text-[#2E3E48] font-sans ">
          Manage your Shopify stores to ensure a streamlined experience across
          <br />
          all your services and stay connected effortlessly.
        </div>
      </div>

      <div className="w-[100%] flex flex-row justify-center items-center py-4 gap-2">
        <div className="relative w-[60%]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <FaSearch />
          </div>
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 bg-white outline-none border-2 border-gray-200 rounded-md"
            placeholder="Search stores..."
          />
        </div>
        <button
          onClick={() => setShowConnect(true)}
          className="flex items-center gap-2 bg-[#2e3e48] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#162120]"
        >
          <FaPlus className="text-xs" />
          Connect Store
        </button>
      </div>

      <div className="flex-1 overflow-auto no-scrollbar pt-4 w-full max-w-[72%]">
        {loading ? (
          <div className="py-4 text-center text-sm text-gray-500">
            Loading stores...
          </div>
        ) : filteredStores.length > 0 ? (
          filteredStores.map((store) => (
            <div key={store.id} className="space-y-1 pb-2">
              <div className="p-3 bg-white border border-gray-300 rounded-md shadow-sm flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-[#2E3E48]">
                    {store.store_name}
                  </h3>
                  <p className="text-xs text-gray-500">{store.store_url}</p>
                  <div className="flex gap-3 mt-1 flex-wrap">
                    {store.shopify_plan && (
                      <span className="text-xs text-gray-400">
                        Plan: {store.shopify_plan}
                      </span>
                    )}
                    {store.currency && (
                      <span className="text-xs text-gray-400">
                        {store.currency}
                      </span>
                    )}
                    {store.country && (
                      <span className="text-xs text-gray-400">
                        {store.country}
                      </span>
                    )}
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                      {store.products_count || 0} products
                    </span>
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                      {store.orders_count || 0} orders
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/store/${store.id}`)}
                    className="font-semibold text-[#2E3E48] px-4 py-2 rounded-md text-xs hover:bg-[#CAF389]"
                  >
                    Manage
                  </button>
                  <button
                    onClick={() => handleDisconnect(store.id)}
                    className="text-red-500 px-3 py-2 rounded-md text-xs hover:bg-red-50"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-sm text-[#2E3E48]">
            No stores connected yet. Click &quot;Connect Store&quot; to get started.
          </div>
        )}
      </div>

      <ConnectStoreModal
        isOpen={showConnect}
        onClose={() => setShowConnect(false)}
        onSuccess={fetchStores}
      />
    </div>
  );
}
