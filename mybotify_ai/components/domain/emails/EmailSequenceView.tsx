"use client";

import { EmailSequenceResponse, sendTestEmail } from "@/api/emails";
import { FaCopy, FaCheck, FaLaptop, FaMobileAlt, FaPaperPlane } from "react-icons/fa";
import { useState } from "react";
import toast from "react-hot-toast";

export default function EmailSequenceView({ sequence }: { sequence: EmailSequenceResponse }) {
  const [activeEmailIdx, setActiveEmailIdx] = useState(0);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);

  const selectedEmail = sequence.emails[activeEmailIdx] || sequence.emails[0];

  const handleCopy = () => {
    const textToCopy = `Subject: ${selectedEmail.subject}\n\n${selectedEmail.body}\n\nCTA: ${selectedEmail.call_to_action}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Email copy copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSending(true);
    try {
      const success = await sendTestEmail({
        to_email: testEmail.trim(),
        subject: selectedEmail.subject,
        body: selectedEmail.body,
        call_to_action: selectedEmail.call_to_action,
      });
      if (success) {
        toast.success(`🎉 Test email successfully sent to ${testEmail}!`);
        setTestEmail("");
      } else {
        toast.error("Failed to send test email. Check your backend SMTP configuration.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while sending the test email.");
    } finally {
      setSending(false);
    }
  };

  const compilePreviewHtml = (subject: string, body: string, callToAction: string) => {
    const formattedBody = body.replace(/\n/g, "<br/>");
    const year = new Date().getFullYear();
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f8fafc;
      color: #334155;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 550px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.03);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .header {
      background-color: #2e3e48;
      color: #ffffff;
      text-align: center;
      padding: 22px 20px;
      font-weight: bold;
      font-size: 18px;
      border-bottom: 4px solid #CAF389;
      letter-spacing: -0.5px;
    }
    .header span {
      color: #CAF389;
    }
    .content {
      padding: 35px 25px;
    }
    .body-text {
      font-size: 14px;
      margin-bottom: 24px;
      color: #334155;
      line-height: 1.8;
    }
    .cta-wrapper {
      text-align: center;
      margin: 30px 0;
    }
    .cta-btn {
      display: inline-block;
      background-color: #2e3e48;
      color: #CAF389;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 24px;
      font-weight: bold;
      font-size: 13px;
      border: 2px solid #CAF389;
      box-shadow: 0 4px 10px rgba(46,62,72,0.15);
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px;
      font-size: 11px;
      color: #64748b;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      line-height: 1.5;
    }
    .footer a {
      color: #2e3e48;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">My<span>Botify</span> AI Marketing</div>
    <div class="content">
      <div class="body-text">${formattedBody}</div>
      <div class="cta-wrapper">
        <a href="#" class="cta-btn" onclick="return false;">${callToAction}</a>
      </div>
    </div>
    <div class="footer">
      This is a test preview of your automated marketing campaign.
      <br>© ${year} MyBotify. All rights reserved.
      <br>If you prefer not to receive this, <a href="#">unsubscribe here</a>.
    </div>
  </div>
</body>
</html>`;
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Title section */}
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-xl font-bold text-[#2e3e48]">Your Generated Sequence</h3>
        <span className="px-3 py-1 bg-[#CAF389] text-[#2e3e48] rounded-full text-xs font-bold shadow-sm border border-[#CAF389]/55">
          {sequence.emails.length} Emails Sequence
        </span>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-gray-200 gap-1.5 pb-px">
        {sequence.emails.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveEmailIdx(idx)}
            className={`px-6 py-3 font-sans font-bold text-sm transition-all border-b-2 rounded-t-xl ${
              activeEmailIdx === idx
                ? "border-[#2e3e48] text-[#2e3e48] bg-white shadow-sm"
                : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-white/50"
            }`}
          >
            Email {idx + 1}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Parameters, copy and test email */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                DELIVERY SCHEDULE
              </span>
              <div className="inline-block bg-[#2e3e48]/5 text-[#2e3e48] px-3 py-1.5 rounded-lg text-xs font-bold">
                {selectedEmail.delay_days === 0
                  ? "⚡ Send Immediately"
                  : `⏳ Wait ${selectedEmail.delay_days} Day(s) after last step`}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                SUBJECT LINE
              </span>
              <p className="font-bold text-[#2e3e48] text-base leading-snug">
                {selectedEmail.subject}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                PLAIN BODY TEXT
              </span>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-gray-600 max-h-[160px] overflow-y-auto no-scrollbar font-mono leading-relaxed whitespace-pre-wrap">
                {selectedEmail.body}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                CALL TO ACTION
              </span>
              <div className="bg-[#2e3e48] text-[#CAF389] py-2.5 px-4 font-bold rounded-xl text-center text-xs border border-[#CAF389]/30 shadow-inner">
                {selectedEmail.call_to_action}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-[#CAF389] hover:bg-[#CAF389]/5 transition-all py-3 rounded-xl font-bold text-[#2e3e48] text-xs shadow-sm"
              >
                {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                {copied ? "Copied to Clipboard!" : "Copy Campaign Payload"}
              </button>
            </div>
          </div>

          {/* Test Email Section */}
          <div className="bg-gradient-to-br from-[#2e3e48] to-[#1a2329] rounded-2xl p-6 text-white shadow-md space-y-4 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#CAF389] rounded-full opacity-10 blur-2xl" />
            <div>
              <h4 className="font-bold text-base text-[#CAF389] flex items-center gap-2">
                <FaPaperPlane className="text-xs" /> Send Test Email
              </h4>
              <p className="text-xs text-gray-300 mt-1 leading-normal">
                Want to see how this email looks in your real inbox? Send a test copy now.
              </p>
            </div>

            <form onSubmit={handleSendTest} className="space-y-3">
              <input
                type="email"
                required
                disabled={sending}
                placeholder="your.email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#CAF389] focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={sending || !testEmail}
                className="w-full bg-[#CAF389] hover:bg-[#bce47b] disabled:opacity-50 disabled:hover:bg-[#CAF389] text-[#2e3e48] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-[#2e3e48]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending test...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Test Copy
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Responsive Device Emulator */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 p-2 shadow-sm">
            <span className="text-xs font-bold text-gray-500 px-2 uppercase tracking-wider">
              Live Responsive Preview
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewMode === "desktop"
                    ? "bg-[#2e3e48] text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <FaLaptop /> Desktop
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewMode === "mobile"
                    ? "bg-[#2e3e48] text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <FaMobileAlt /> Mobile
              </button>
            </div>
          </div>

          <div className="flex justify-center items-center py-6 bg-gray-100/50 rounded-2xl border border-dashed border-gray-300 min-h-[500px]">
            {previewMode === "desktop" ? (
              /* Desktop Emulator Box */
              <div className="w-full max-w-[620px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-[520px]">
                {/* Desktop browser window chrome */}
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
                  </div>
                  <div className="bg-white rounded-md border border-gray-200/60 px-3 py-0.5 text-[10px] text-gray-400 text-center flex-1 max-w-[320px] mx-auto truncate font-sans">
                    MyBotify AI Previewer
                  </div>
                </div>
                <iframe
                  title="Desktop Email Preview"
                  className="w-full flex-1 border-none bg-gray-50/50"
                  srcDoc={compilePreviewHtml(selectedEmail.subject, selectedEmail.body, selectedEmail.call_to_action)}
                />
              </div>
            ) : (
              /* Mobile Smartphone Frame */
              <div className="relative w-[320px] h-[550px] bg-[#1a2329] rounded-[40px] p-3 shadow-2xl border-4 border-[#2e3e48] flex flex-col">
                {/* Speaker notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#1a2329] rounded-full z-20 flex justify-center items-center">
                  <div className="w-10 h-1 bg-[#2e3e48] rounded-full" />
                </div>
                
                {/* Smartphone Screen container */}
                <div className="w-full h-full bg-white rounded-[32px] overflow-hidden flex flex-col pt-4 border border-[#2e3e48]/30">
                  <iframe
                    title="Mobile Email Preview"
                    className="w-full flex-1 border-none bg-gray-50/50"
                    srcDoc={compilePreviewHtml(selectedEmail.subject, selectedEmail.body, selectedEmail.call_to_action)}
                  />
                </div>
                
                {/* Home indicator bar at bottom */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/20 rounded-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
