"use client";

import { AiOutlineGlobal } from "react-icons/ai";
import { BsCaretDownFill, BsChatSquareDotsFill } from "react-icons/bs";
import { IoPerson } from "react-icons/io5";
import { useState, useRef, useEffect } from "react";
import { Separator } from "@radix-ui/react-separator";

const HeaderWithPopovers = () => {
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const popoverRefs = useRef<PopoverRefs>({});
  const togglePopover = (popoverName: string | null) => {
    setOpenPopover(openPopover === popoverName ? null : popoverName);
  };

  interface PopoverRefs {
    [key: string]: HTMLDivElement | null;
  }

  const handleClickOutside = (event: MouseEvent) => {
    const isOutside = Object.keys(popoverRefs.current).every(
      (key) =>
        popoverRefs.current[key] &&
        !popoverRefs.current[key]!.contains(event.target as Node)
    );
    if (isOutside) {
      setOpenPopover(null); // Close all popovers if clicked outside
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="h-[10%] w-full border-b-2 border-gray-300">
      <div className="h-full w-full flex items-center justify-between px-6 ">
        <div>
          <h1 className="text-2xl font-bold text-[#2E3E48] font-sans">
            MyBotify<span className="font-normal font-sans">.com</span>
          </h1>
        </div>

        <div className="flex flex-row relative">
          <div className="relative">
            <button
              onClick={() => togglePopover("about")}
              className="px-2 py-2 font-sans text-[#2E3E48]  font-medium"
            >
              <div className="flex flex-row justify-center items-center gap-2 hover:bg-[#caf389] hover:rounded-lg hover:text-[#2e3e48] p-2 text-sm">
                <BsChatSquareDotsFill className="text-[#2e3e48] text-xs" />
                About
                <BsCaretDownFill className="text-[#2e3e48] text-xs" />
              </div>
            </button>
            {openPopover === "about" && (
              <div className="absolute  bg-white shadow-md rounded-md p-4">
                <h1 className="text-sm text-gray-700 font-sans font-semibold">
                  Version: 1.0.0
                </h1>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => togglePopover("english")}
              className="px-2 py-2 font-sans text-[#2E3E48]  font-medium"
            >
              <div className="flex flex-row justify-center items-center gap-2 hover:bg-[#caf389] hover:rounded-lg hover:text-[#2e3e48] p-2 text-sm">
                <AiOutlineGlobal className="text-[#2e3e48] text-xs" />
                English
                <BsCaretDownFill className="text-[#2e3e48] text-xs" />
              </div>
            </button>
            {openPopover === "english" && (
              <div className="absolute left-5 bg-white shadow-md rounded-md p-4">
                <h1 className="text-sm text-gray-700 font-sans font-bold shadow-sm pb-2">
                  English
                </h1>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => togglePopover("profile")}
              className="px-2 py-2 font-sans text-[#2E3E48]  font-medium"
            >
              <div className="flex flex-row justify-center items-center gap-2 hover:bg-[#caf389] hover:rounded-lg hover:text-[#2e3e48] p-2 text-sm">
                <IoPerson className="text-[#2e3e48] text-xs" />
                Profile
                <BsCaretDownFill className="text-[#2e3e48] text-xs" />
              </div>
            </button>
            {openPopover === "profile" && (
              <div className="absolute  left-2 bg-white shadow-md rounded-md p-4">
                <h1 className="text-sm text-gray-700 font-sans font-bold shadow-sm pb-2">
                  My Profile
                </h1>
                <Separator />
                <h1 className="text-sm text-gray-700 font-sans font-bold shadow-sm pt-2">
                  Settings
                </h1>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderWithPopovers;
