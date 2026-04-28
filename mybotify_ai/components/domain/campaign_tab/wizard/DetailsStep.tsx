"use client";

import { useEffect, useState } from "react";
import { CampaignState } from "./WizardCoordinator";

interface DetailsStepProps {
  state: CampaignState;
  updateState: (updates: Partial<CampaignState>) => void;
  onNext: () => void;
  onCancel: () => void;
}

export default function DetailsStep({ state, updateState, onNext, onCancel }: DetailsStepProps) {
  const [localName, setLocalName] = useState(state.name);
  const [localBudget, setLocalBudget] = useState(state.budget);

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
