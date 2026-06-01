import { useState, useEffect } from "react";
import { FaMagic, FaEnvelopeOpenText, FaBullhorn, FaShoppingCart } from "react-icons/fa";

interface EmailWizardProps {
  products: any[];
  onGenerate: (data: any) => void;
  generating: boolean;
  defaultType?: string;
  defaultAudience?: string;
  defaultTone?: string;
}

export default function EmailWizard({ 
  products, 
  onGenerate, 
  generating,
  defaultType,
  defaultAudience,
  defaultTone
}: EmailWizardProps) {
  const [sequenceType, setSequenceType] = useState(defaultType || "Abandoned Cart");
  const [tone, setTone] = useState(defaultTone || "Urgent & Persuasive");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [audience, setAudience] = useState(defaultAudience || "Previous visitors who added items to cart");

  // Dynamic observers to update wizard when deep-linked query parameters change/load
  useEffect(() => {
    if (defaultType) {
      setSequenceType(defaultType);
    }
  }, [defaultType]);

  useEffect(() => {
    if (defaultAudience) {
      setAudience(defaultAudience);
    }
  }, [defaultAudience]);

  useEffect(() => {
    if (defaultTone) {
      setTone(defaultTone);
    }
  }, [defaultTone]);

  const sequenceTypes = [
    { id: "Abandoned Cart", icon: <FaShoppingCart />, desc: "Recover lost sales" },
    { id: "Welcome Series", icon: <FaEnvelopeOpenText />, desc: "Onboard new subscribers" },
    { id: "Promotional Blast", icon: <FaBullhorn />, desc: "Announce sales or new drops" }
  ];

  const handleGenerate = () => {
    onGenerate({
      sequence_type: sequenceType,
      tone: tone,
      product_context: selectedProduct,
      audience: audience
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-[#2e3e48] mb-6">Create New Sequence</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Sequence Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sequence Type</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sequenceTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setSequenceType(type.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    sequenceType === type.id
                      ? "border-[#CAF389] bg-[#CAF389]/10"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`text-xl mb-2 ${sequenceType === type.id ? "text-[#92C44B]" : "text-gray-400"}`}>
                    {type.icon}
                  </div>
                  <div className="font-semibold text-sm text-[#2e3e48]">{type.id}</div>
                  <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience Context</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CAF389]"
              placeholder="e.g. VIP customers, first-time buyers..."
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Tone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CAF389]"
            >
              <option value="Urgent & Persuasive">Urgent & Persuasive (Best for Carts)</option>
              <option value="Friendly & Welcoming">Friendly & Welcoming</option>
              <option value="Professional & Trustworthy">Professional & Trustworthy</option>
              <option value="Exciting & Hype">Exciting & Hype (Best for Promos)</option>
            </select>
          </div>

          {/* Product Context */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Focus Product (Optional)</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CAF389]"
            >
              <option value="">All Products / General Store</option>
              {products?.map((p) => (
                <option key={p.id} value={p.title}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-lg font-bold transition-all ${
                generating
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#2e3e48] text-[#CAF389] hover:bg-[#1a262d] shadow-lg shadow-[#2e3e48]/20"
              }`}
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                  Generating Sequence...
                </>
              ) : (
                <>
                  <FaMagic />
                  Generate AI Sequence
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
