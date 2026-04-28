"use client";

import { useState } from "react";
import { CampaignState } from "./WizardCoordinator";

interface CreativeStepProps {
  state: CampaignState;
  updateState: (updates: Partial<CampaignState>) => void;
  onGenerate: () => void;
  onBack: () => void;
  isGenerating: boolean;
}

export default function CreativeStep({ state, updateState, onGenerate, onBack, isGenerating }: CreativeStepProps) {
  const [localGoal, setLocalGoal] = useState(state.goal);
  const [localAudience, setLocalAudience] = useState(state.targetAudience);

  return (
    <div className="flex flex-col h-full flex-1">
      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Marketing Goal</label>
          <input type="text" value={localGoal} onChange={(e) => setLocalGoal(e.target.value)} onBlur={() => updateState({ goal: localGoal })} className="mt-1 w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Target Audience</label>
          <input type="text" value={localAudience} onChange={(e) => setLocalAudience(e.target.value)} onBlur={() => updateState({ targetAudience: localAudience })} className="mt-1 w-full p-2 border rounded" />
        </div>
        <div className="flex justify-center py-4">
          <button onClick={() => { updateState({ goal: localGoal, targetAudience: localAudience }); onGenerate(); }} disabled={isGenerating} className="bg-[#CAF389] text-[#2e3e48] px-6 py-3 rounded-lg font-bold disabled:opacity-50 flex items-center shadow transition-all hover:-translate-y-1">
            {isGenerating ? "Generating..." : "Generate Ad Copy with AI"}
          </button>
        </div>
      </div>
      <div className="flex justify-between pt-4 border-t mt-4">
        <button onClick={onBack} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-semibold transition-all hover:-translate-y-1" disabled={isGenerating}>Back</button>
      </div>
    </div>
  );
}
