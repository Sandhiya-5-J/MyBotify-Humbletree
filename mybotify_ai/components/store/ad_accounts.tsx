/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getStoreAdAccounts, connectAdAccount, disconnectAdAccount } from "@/api/store";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { SiGoogleads } from "react-icons/si";
import { MdOutlineSecurity, MdLink, MdLinkOff } from "react-icons/md";
import toast from "react-hot-toast";

type Props = {
  storeId: number;
};

export default function AdAccounts({ storeId }: Props) {
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Connection forms state
  const [metaAccountId, setMetaAccountId] = useState("");
  const [metaToken, setMetaToken] = useState("");
  const [googleAccountId, setGoogleAccountId] = useState("");
  const [googleToken, setGoogleToken] = useState("");

  const [connectingMeta, setConnectingMeta] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);

  const fetchAdAccounts = async () => {
    setLoading(true);
    try {
      const res = await getStoreAdAccounts(storeId);
      setAdAccounts(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdAccounts();
  }, [storeId]);

  const handleConnect = async (platform: "Facebook" | "Google Ads") => {
    const isMeta = platform === "Facebook";
    const accountId = isMeta ? metaAccountId : googleAccountId;
    const token = isMeta ? metaToken : googleToken;

    if (!accountId || !token) {
      toast.error("Please fill in both Account ID and Token fields.");
      return;
    }

    if (isMeta) setConnectingMeta(true);
    else setConnectingGoogle(true);

    try {
      await connectAdAccount(storeId, {
        platform,
        account_id: accountId,
        access_token: token,
      });
      toast.success(`${platform} connected successfully!`);
      // Clear forms
      if (isMeta) {
        setMetaAccountId("");
        setMetaToken("");
      } else {
        setGoogleAccountId("");
        setGoogleToken("");
      }
      fetchAdAccounts();
    } catch (e: any) {
      toast.error(e.message || `Failed to connect ${platform}`);
    } finally {
      if (isMeta) setConnectingMeta(false);
      else setConnectingGoogle(false);
    }
  };

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Are you sure you want to disconnect your ${platform} account?`)) return;
    try {
      await disconnectAdAccount(storeId, platform);
      toast.success(`${platform} disconnected successfully.`);
      fetchAdAccounts();
    } catch (e: any) {
      toast.error(e.message || `Failed to disconnect ${platform}`);
    }
  };

  const metaAccount = adAccounts.find((acc) => acc.platform === "Facebook");
  const googleAccount = adAccounts.find((acc) => acc.platform === "Google Ads");

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        Loading connected accounts...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#2E3E48] mb-1">🔗 Connected Ad Accounts</h2>
        <p className="text-xs text-gray-500">
          Link Meta (Facebook/Instagram) and Google Ads accounts to automate campaign creation, optimize audiences, and fetch live analytics directly into your store dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meta / Facebook Ads Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 text-blue-600 flex justify-center items-center rounded-xl text-xl">
                <FaFacebook />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Meta Ads</h3>
                <p className="text-xs text-gray-400">Facebook & Instagram Campaigns</p>
              </div>
            </div>
            {metaAccount ? (
              <span className="text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-full font-bold flex items-center gap-1.5 border border-green-200">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span> Connected
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full font-bold">
                Not Linked
              </span>
            )}
          </div>

          {metaAccount ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Account ID:</span>
                  <span className="font-mono font-semibold text-gray-700">{metaAccount.account_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Token Status:</span>
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <MdOutlineSecurity /> Active
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDisconnect("Facebook")}
                className="w-full py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                <MdLinkOff size={16} /> Disconnect Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Ad Account ID</label>
                  <input
                    type="text"
                    placeholder="e.g. act_123456789"
                    value={metaAccountId}
                    onChange={(e) => setMetaAccountId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAF389] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">System User Access Token</label>
                  <input
                    type="password"
                    placeholder="EAAGb..."
                    value={metaToken}
                    onChange={(e) => setMetaToken(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAF389] transition-all"
                  />
                </div>
              </div>
              <button
                onClick={() => handleConnect("Facebook")}
                disabled={connectingMeta}
                className="w-full py-2.5 bg-[#2E3E48] hover:bg-[#1C282F] text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MdLink size={18} /> {connectingMeta ? "Connecting..." : "Connect Meta Account"}
              </button>
            </div>
          )}
        </div>

        {/* Google Ads Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-yellow-50 text-yellow-600 flex justify-center items-center rounded-xl text-xl">
                <SiGoogleads />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Google Ads</h3>
                <p className="text-xs text-gray-400">Search, Performance Max & Shopping</p>
              </div>
            </div>
            {googleAccount ? (
              <span className="text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-full font-bold flex items-center gap-1.5 border border-green-200">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span> Connected
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full font-bold">
                Not Linked
              </span>
            )}
          </div>

          {googleAccount ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer ID:</span>
                  <span className="font-mono font-semibold text-gray-700">{googleAccount.account_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Token Status:</span>
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <MdOutlineSecurity /> Active
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDisconnect("Google Ads")}
                className="w-full py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                <MdLinkOff size={16} /> Disconnect Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Customer Client ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 123-456-7890"
                    value={googleAccountId}
                    onChange={(e) => setGoogleAccountId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAF389] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Developer Token / Refresh Token</label>
                  <input
                    type="password"
                    placeholder="Enter Google Ads auth developer credential..."
                    value={googleToken}
                    onChange={(e) => setGoogleToken(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAF389] transition-all"
                  />
                </div>
              </div>
              <button
                onClick={() => handleConnect("Google Ads")}
                disabled={connectingGoogle}
                className="w-full py-2.5 bg-[#2E3E48] hover:bg-[#1C282F] text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MdLink size={18} /> {connectingGoogle ? "Connecting..." : "Connect Google Ads Account"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
