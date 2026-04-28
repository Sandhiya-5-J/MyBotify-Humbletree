"use client";

import { useEffect, useState } from "react";
import { CampaignState } from "./WizardCoordinator";
import { getStoreProducts } from "@/api/store";

interface ProductsStepProps {
  state: CampaignState;
  updateState: (updates: Partial<CampaignState>) => void;
  onNext: () => void;
  onBack: () => void;
  storeId: number;
}

export default function ProductsStep({ state, updateState, onNext, onBack, storeId }: ProductsStepProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoreProducts(storeId).then((res) => {
      setProducts(res || []);
      setLoading(false);
    });
  }, [storeId]);

  const toggleProduct = (product: any) => {
    let selected: any[] = [];
    try { selected = JSON.parse(state.productsTargeted || "[]"); } catch(e) {}
    if (selected.find((p: any) => p.id === product.id)) {
      selected = selected.filter((p: any) => p.id !== product.id);
    } else {
      selected.push({ id: product.id, title: product.title, price: product.price });
    }
    const context = selected.map((p: any) => `${p.title} ($${p.price})`).join(", ");
    updateState({ productsTargeted: JSON.stringify(selected), productsContext: context });
  };

  const selectedIds = (() => {
    try { return JSON.parse(state.productsTargeted || "[]").map((p: any) => p.id); } catch(e) { return []; }
  })();

  return (
    <div className="flex flex-col h-full flex-1">
      <div className="flex-1 space-y-4">
        <label className="block text-sm font-semibold text-gray-700">Select Target Products (Optional)</label>
        {loading ? (
          <div className="text-gray-500">Loading products...</div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto border rounded p-2 grid grid-cols-2 gap-2">
            {products.map(p => (
              <div key={p.id} onClick={() => toggleProduct(p)} className={`p-3 border rounded cursor-pointer ${selectedIds.includes(p.id) ? 'border-[#CAF389] bg-[#CAF389]/10' : 'hover:bg-gray-50'}`}>
                <div className="font-semibold text-sm truncate">{p.title}</div>
                <div className="text-xs text-gray-500">${p.price}</div>
              </div>
            ))}
            {products.length === 0 && <div className="text-sm text-gray-500">No products found for this store.</div>}
          </div>
        )}
      </div>
      <div className="flex justify-between pt-4 border-t mt-4">
        <button onClick={onBack} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-semibold">Back</button>
        <button onClick={onNext} className="bg-[#2e3e48] text-white px-4 py-2 rounded font-semibold">Next Step</button>
      </div>
    </div>
  );
}
