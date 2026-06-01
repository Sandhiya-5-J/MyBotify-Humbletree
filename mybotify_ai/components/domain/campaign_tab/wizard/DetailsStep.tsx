"use client";

import { useEffect, useState } from "react";
import { CampaignState } from "./WizardCoordinator";
import { getStoreAdAccounts } from "@/api/store";

interface DetailsStepProps {
  state: CampaignState;
  updateState: (updates: Partial<CampaignState>) => void;
  onNext: () => void;
  onCancel: () => void;
  storeId: number;
}

export default function DetailsStep({ state, updateState, onNext, onCancel, storeId }: DetailsStepProps) {
  const [localName, setLocalName] = useState(state.name);
  const [localBudget, setLocalBudget] = useState(state.budget);
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoreAdAccounts(storeId)
      .then((res) => {
        setAdAccounts(res || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [storeId]);

  const targetPlatform = state.platform === "Google Ads" ? "Google Ads" : "Facebook";
  const isConnected = adAccounts.some(acc => acc.platform === targetPlatform && acc.is_active);

  return (
    <div className="flex flex-col h-full flex-1">
      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Campaign Name</label>
          <input
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={() => updateState({ name: localName })}
            placeholder="Summer Sale 2024"
            className="mt-1 w-full p-2 border rounded"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700">Platform</label>
            <select
              value={state.platform}
              onChange={(e) => updateState({ platform: e.target.value })}
              className="mt-1 w-full p-2 border rounded"
            >
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Google Ads">Google Ads</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700">Budget ($)</label>
            <input
              type="number"
              value={localBudget}
              onChange={(e) => setLocalBudget(Number(e.target.value))}
              onBlur={() => updateState({ budget: localBudget })}
              className="mt-1 w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Ad Account Connection Warning */}
        {!loading && (
          <div className={`p-3.5 rounded-lg border text-sm flex items-start gap-2.5 transition-all duration-300 ${
            isConnected 
              ? "bg-green-50 border-green-200 text-green-800" 
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}>
            <span className="text-base">{isConnected ? "✅" : "⚠️"}</span>
            <div>
              <p className="font-semibold mb-0.5">
                {isConnected 
                  ? `${targetPlatform} Ad Account Connected` 
                  : `${targetPlatform} Ad Account Not Connected`}
              </p>
              <p className="text-xs opacity-90 leading-normal">
                {isConnected 
                  ? "This campaign will deploy directly to your connected ad account." 
                  : "Your campaign will be deployed in Sandbox/Mock mode. You can link your ad account in Store Settings."}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t mt-4">
        <button onClick={onCancel} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-semibold">
          Cancel
        </button>
        <button onClick={() => {
          updateState({ name: localName, budget: localBudget });
          onNext();
        }} disabled={!localName} className="bg-[#2e3e48] text-white px-4 py-2 rounded font-semibold disabled:opacity-50 hover:-translate-y-1 transition-all">
          Next Step
        </button>
      </div>
    </div>
  );
}

