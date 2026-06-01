import { EmailSequenceResponse } from "@/api/emails";
import { FaCopy, FaCheck } from "react-icons/fa";
import { useState } from "react";

export default function EmailSequenceView({ sequence }: { sequence: EmailSequenceResponse }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (email: any, index: number) => {
    const textToCopy = `Subject: ${email.subject}\n\n${email.body}\n\nCTA: ${email.call_to_action}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-xl font-bold text-[#2e3e48]">Your Generated Sequence</h3>
        <span className="px-3 py-1 bg-[#CAF389] text-[#2e3e48] rounded-full text-xs font-bold">
          {sequence.emails.length} Emails
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sequence.emails.map((email, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative group">
            
            {/* Header */}
            <div className="bg-[#2e3e48] text-white px-5 py-3 flex justify-between items-center">
              <span className="font-bold text-[#CAF389]">Email {idx + 1}</span>
              <span className="text-xs text-gray-300">
                {email.delay_days === 0 ? "Send Immediately" : `Wait ${email.delay_days} Day(s)`}
              </span>
            </div>

            {/* Subject */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Subject</p>
              <p className="font-bold text-[#2e3e48]">{email.subject}</p>
            </div>

            {/* Body */}
            <div className="px-5 py-4 flex-1">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Body</p>
              <div 
                className="text-sm text-gray-700 whitespace-pre-wrap font-sans"
                dangerouslySetInnerHTML={{ __html: email.body.replace(/\n/g, "<br/>") }}
              />
            </div>

            {/* CTA */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Call to Action Button</p>
              <button className="w-full py-2 bg-[#CAF389] text-[#2e3e48] font-bold rounded-lg text-sm cursor-default">
                {email.call_to_action}
              </button>
            </div>

            {/* Hover Copy Button overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleCopy(email, idx)}
                className="p-2 bg-white rounded-md shadow text-[#2e3e48] hover:bg-gray-50 transition-colors"
                title="Copy to clipboard"
              >
                {copiedIndex === idx ? <FaCheck className="text-green-500" /> : <FaCopy />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
