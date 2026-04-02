"use client";

import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <div className="w-full h-10 flex flex-row justify-center">
      <div className="flex justify-center">
        <button className="pr-2 text-[#1E3E48] text-xs ">Terms of use</button>
        <Separator orientation="vertical" />

        <button className="px-2 text-[#2E3E48] text-xs ">Privacy Policy</button>
        <Separator orientation="vertical" />
        <button className="pl-2 text-[#2E3E48] text-xs">
          @2025 MyBotify.com, Inc
        </button>
      </div>
    </div>
  );
}
