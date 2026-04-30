"use client";

import { useState } from "react";
import DetailsStep from "./DetailsStep";
import ProductsStep from "./ProductsStep";
import CreativeStep from "./CreativeStep";
import ReviewStep from "./ReviewStep";
import { generateCampaignContent, createCampaign } from "@/api/campaign";
import toast from "react-hot-toast";

export interface CampaignState {
  name: string;
  platform: string;
  budget: number;
  goal: string;
  targetAudience: string;
  productsTargeted: string;
  productsContext: string;
  generatedCopy: string;
}

export default function WizardCoordinator({ storeId, onClose, onSuccess }: { storeId: number, onClose: () => void, onSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<CampaignState>({
    name: "",
    platform: "Facebook",
    budget: 100,
    goal: "Increase sales",
    targetAudience: "Broad audience",
    productsTargeted: "[]",
    productsContext: "",
    generatedCopy: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  const updateState = (updates: Partial<CampaignState>) => setState(prev => ({ ...prev, ...updates }));

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateCampaignContent({
        store_id: storeId,
        platform: state.platform,
        goal: state.goal,
        target_audience: state.targetAudience,
        products_context: state.productsContext,
      });
      if (res && res.generated_copy) {
        updateState({ generatedCopy: res.generated_copy });
        toast.success("Ad copy generated successfully!");
        handleNext();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate ad copy");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await createCampaign({
        store_id: storeId,
        name: state.name,
        platform: state.platform,
        budget: state.budget,
        target_audience: state.targetAudience,
        generated_copy: state.generatedCopy,
        products_targeted: state.productsTargeted,
      });
      toast.success("Campaign created successfully!");
      onSuccess();
    } catch (e: any) {
      toast.error(e.message || "Failed to save campaign");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto pt-10 pb-10">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl my-8 min-h-[500px] flex flex-col">
        <h2 className="text-2xl font-bold text-[#2e3e48] mb-2">Create AI Campaign</h2>
        <div className="flex gap-2 mb-6">
          {[1,2,3,4].map(s => (
            <div key={s} className={`h-2 flex-1 rounded ${s <= step ? 'bg-[#CAF389]' : 'bg-gray-200'}`} />
          ))}
        </div>
        
        <div className="flex-1 flex flex-col">
          {step === 1 && <DetailsStep state={state} updateState={updateState} onNext={handleNext} onCancel={onClose} />}
          {step === 2 && <ProductsStep state={state} updateState={updateState} onNext={handleNext} onBack={handleBack} storeId={storeId} />}
          {step === 3 && <CreativeStep state={state} updateState={updateState} onGenerate={handleGenerate} onBack={handleBack} isGenerating={isGenerating} />}
          {step === 4 && <ReviewStep state={state} onSave={handleSave} onBack={handleBack} isSaving={isSaving} updateState={updateState} />}
        </div>
      </div>
    </div>
  );
}
