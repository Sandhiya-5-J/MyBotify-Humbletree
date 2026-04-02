/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { connectStore, addStoreManual, uploadProductsCSV, uploadOrdersCSV, uploadCustomersCSV } from "@/api/store";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ConnectStoreModal({ isOpen, onClose, onSuccess }: Props) {
  const [activeTab, setActiveTab] = useState<"api" | "manual">("manual");

  // API Tab state
  const [storeUrl, setStoreUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");

  // Manual Tab state
  const [storeName, setStoreName] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("");
  const [country, setCountry] = useState("");
  const [productsFile, setProductsFile] = useState<File | null>(null);
  const [ordersFile, setOrdersFile] = useState<File | null>(null);
  const [customersFile, setCustomersFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "uploading" | "done">("form");
  const [uploadStatus, setUploadStatus] = useState("");

  const handleApiConnect = async () => {
    if (!storeUrl.trim() || !accessToken.trim()) {
      alert("Please fill in both fields");
      return;
    }
    setLoading(true);
    try {
      await connectStore(storeUrl.trim(), accessToken.trim());
      alert("Store connected via Shopify API!");
      resetAndClose();
    } catch (error: any) {
      alert(error.message || "Failed to connect store");
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = async () => {
    if (!storeName.trim()) {
      alert("Please enter a store name");
      return;
    }
    setLoading(true);
    setStep("uploading");
    try {
      setUploadStatus("Creating store...");
      const store = await addStoreManual({
        store_name: storeName.trim(),
        store_url: manualUrl.trim() || undefined,
        description: description.trim() || undefined,
        shopify_email: email.trim() || undefined,
        currency: currency.trim() || undefined,
        country: country.trim() || undefined,
      });

      if (productsFile && store?.id) {
        setUploadStatus("Uploading products CSV...");
        await uploadProductsCSV(store.id, productsFile);
      }

      if (ordersFile && store?.id) {
        setUploadStatus("Uploading orders CSV...");
        await uploadOrdersCSV(store.id, ordersFile);
      }

      if (customersFile && store?.id) {
        setUploadStatus("Uploading customers CSV...");
        await uploadCustomersCSV(store.id, customersFile);
      }

      setStep("done");
      setUploadStatus("Store added successfully!");
      setTimeout(() => {
        resetAndClose();
      }, 1500);
    } catch (error: any) {
      alert(error.message || "Failed to add store");
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStoreUrl("");
    setAccessToken("");
    setStoreName("");
    setManualUrl("");
    setDescription("");
    setEmail("");
    setCurrency("");
    setCountry("");
    setProductsFile(null);
    setOrdersFile(null);
    setCustomersFile(null);
    setStep("form");
    setUploadStatus("");
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative w-[520px] max-h-[85vh] bg-white rounded-xl shadow-lg z-10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-bold text-[#2E3E48]">Connect Store</h3>
          <button onClick={onClose} className="text-red-400 hover:text-red-600">
            <IoIosCloseCircle size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "manual"
                ? "text-[#2e3e48] border-b-2 border-[#2e3e48]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            📝 Manual Entry
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "api"
                ? "text-[#2e3e48] border-b-2 border-[#2e3e48]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            🔑 Shopify API
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {step === "uploading" || step === "done" ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className={`text-4xl mb-4 ${step === "done" ? "" : "animate-spin"}`}>
                {step === "done" ? "✅" : "⏳"}
              </div>
              <p className="text-sm text-[#2E3E48] font-medium">{uploadStatus}</p>
            </div>
          ) : activeTab === "manual" ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Store Name *</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="My Awesome Store"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2e3e48] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Store URL</label>
                <input
                  type="text"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="mystore.myshopify.com"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2e3e48] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your store"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2e3e48] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="store@example.com"
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2e3e48] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Currency</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="USD"
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2e3e48] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="India"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2e3e48] text-sm"
                />
              </div>

              {/* CSV Uploads */}
              <div className="pt-2 border-t mt-3">
                <p className="text-xs text-gray-500 mb-3">
                  Upload CSV files exported from Shopify (optional — you can do this later too)
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 border border-dashed border-gray-300 rounded-lg">
                    <span className="text-sm text-gray-600 flex-1">
                      {productsFile ? `📄 ${productsFile.name}` : "Products CSV"}
                    </span>
                    <label className="cursor-pointer px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200">
                      {productsFile ? "Change" : "Upload"}
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setProductsFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-2 border border-dashed border-gray-300 rounded-lg">
                    <span className="text-sm text-gray-600 flex-1">
                      {ordersFile ? `📄 ${ordersFile.name}` : "Orders CSV"}
                    </span>
                    <label className="cursor-pointer px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200">
                      {ordersFile ? "Change" : "Upload"}
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setOrdersFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-3 p-2 border border-dashed border-gray-300 rounded-lg">
                    <span className="text-sm text-gray-600 flex-1">
                      {customersFile ? `📄 ${customersFile.name}` : "Customers CSV"}
                    </span>
                    <label className="cursor-pointer px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200">
                      {customersFile ? "Change" : "Upload"}
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCustomersFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={handleManualAdd}
                disabled={loading}
                className="w-full bg-[#2e3e48] text-white py-2.5 rounded-lg font-medium hover:bg-[#162120] disabled:opacity-50 mt-2"
              >
                {loading ? "Adding..." : "Add Store"}
              </button>
            </div>
          ) : (
            /* API Tab */
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Connect using your Shopify Admin API access token.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Store URL</label>
                <input
                  type="text"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="mystore.myshopify.com"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2e3e48] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Admin API Access Token</label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2e3e48] text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Shopify Admin → Settings → Apps → Develop apps → API credentials
                </p>
              </div>
              <button
                onClick={handleApiConnect}
                disabled={loading}
                className="w-full bg-[#2e3e48] text-white py-2.5 rounded-lg font-medium hover:bg-[#162120] disabled:opacity-50"
              >
                {loading ? "Connecting..." : "Connect via Shopify API"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
