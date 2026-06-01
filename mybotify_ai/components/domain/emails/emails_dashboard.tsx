"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import SideBar from "@/components/domain/common/side_bar";
import HeaderWithPopovers from "@/components/common/header";
import Footer from "@/components/common/footer";
import { getMyStores, getStoreProducts } from "@/api/store";
import { generateEmailSequence, EmailSequenceResponse } from "@/api/emails";
import EmailWizard from "./EmailWizard";
import EmailSequenceView from "./EmailSequenceView";
import toast from "react-hot-toast";

export default function EmailsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const defaultType = searchParams.get("type") || undefined;
  const defaultAudience = searchParams.get("audience") || undefined;
  const defaultTone = searchParams.get("tone") || undefined;

  const [authChecked, setAuthChecked] = useState(false);
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sequence, setSequence] = useState<EmailSequenceResponse | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/");
    } else {
      setAuthChecked(true);
      loadStores();
    }
  }, [router]);

  const loadStores = async () => {
    try {
      const data = await getMyStores();
      setStores(data || []);
      if (data && data.length > 0) {
        setSelectedStoreId(data[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStoreId) {
      loadProducts(selectedStoreId);
    }
  }, [selectedStoreId]);

  const loadProducts = async (storeId: number) => {
    setLoading(true);
    try {
      const data = await getStoreProducts(storeId);
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (formData: { sequence_type: string, tone: string, product_context: string, audience: string }) => {
    if (!selectedStoreId) return;
    setGenerating(true);
    setSequence(null);
    try {
      const res = await generateEmailSequence({
        store_id: selectedStoreId,
        ...formData
      });
      if (res) {
        setSequence(res);
        toast.success("Email sequence generated successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate email sequence.");
    } finally {
      setGenerating(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="w-full h-full bg-[#F1F5F2] flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#CAF389] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F1F5F2]">
      <HeaderWithPopovers />
      <div className="flex min-h-[calc(100vh-64px)] flex-col md:flex-row">
        {/* Sidebar */}
        <div className="hidden md:block md:w-[14%] min-h-full">
          <SideBar
            activeTab="emails"
            onClickTab={() => {}}
            activeInfo=""
            onClickInfo={() => {}}
          />
        </div>

        {/* Main Content */}
        <div className="w-full md:flex-1 flex flex-col border-r-2 border-gray-300">
          <div className="flex-1 overflow-auto px-4 md:px-8 py-6 no-scrollbar">
            {/* Page Title + Store Selector */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#2e3e48]">
                  Automated Email Sequences
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Generate high-converting email campaigns using AI
                </p>
              </div>

              <div className="flex items-center gap-3">
                {stores.length > 0 && (
                  <select
                    value={selectedStoreId || ""}
                    onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                    className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-[#2e3e48] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#CAF389] focus:border-transparent"
                  >
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.store_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-[#CAF389] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                <EmailWizard 
                  products={products} 
                  onGenerate={handleGenerate} 
                  generating={generating} 
                  defaultType={defaultType}
                  defaultAudience={defaultAudience}
                  defaultTone={defaultTone}
                />
                
                {sequence && (
                  <EmailSequenceView sequence={sequence} />
                )}
              </div>
            )}
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}
