"use client";

import { useState } from "react";
import { CampaignState } from "./WizardCoordinator";

interface ReviewStepProps {
  state: CampaignState;
  updateState: (updates: Partial<CampaignState>) => void;
  onSave: () => void;
  onBack: () => void;
  isSaving: boolean;
}

export default function ReviewStep({ state, updateState, onSave, onBack, isSaving }: ReviewStepProps) {
  const [localCopy, setLocalCopy] = useState(state.generatedCopy);

  return (
    <div className="flex flex-col h-full flex-1">
      <div className="flex-1 space-y-4">
        <div className="bg-gray-50 p-4 rounded border">
          <h3 className="font-bold text-lg mb-2">Campaign Summary</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-semibold">Name:</span> {state.name}</div>
            <div><span className="font-semibold">Platform:</span> {state.platform}</div>
            <div><span className="font-semibold">Budget:</span> ${state.budget}</div>
            <div><span className="font-semibold">Audience:</span> {state.targetAudience}</div>
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Generated Ad Copy (You can edit this)</label>
          <textarea value={localCopy} onChange={(e) => setLocalCopy(e.target.value)} onBlur={() => updateState({ generatedCopy: localCopy })} className="w-full p-3 border rounded h-[200px] focus:ring-2 focus:ring-[#CAF389] outline-none" />
        </div>
      </div>
      <div className="flex justify-between pt-4 border-t mt-4">
        <button onClick={onBack} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-semibold transition-all hover:-translate-y-1" disabled={isSaving}>Back</button>
        <button onClick={() => { updateState({ generatedCopy: localCopy }); onSave(); }} disabled={isSaving || !localCopy} className="bg-[#2e3e48] text-white px-6 py-2 rounded font-semibold disabled:opacity-50 transition-all hover:-translate-y-1">
          {isSaving ? "Saving..." : "Save Campaign"}
        </button>
      </div>
    </div>
  );
}
