/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  MdDomainAdd,
  MdCampaign,
  MdPlayArrow,
  MdOutlineArrowBack,
  MdBarChart,
} from "react-icons/md";
import { FaCircle } from "react-icons/fa6";
import { IoLogOut } from "react-icons/io5";
import { useRouter } from "next/navigation";
import Link from "next/link";
type SideBarProps = {
  activeTab: string;
  onClickTab: (tab: string) => void;
  activeInfo: string;
  onClickInfo: (tab: string) => void;
};

export default function SideBar({
  activeTab,
  onClickTab,
  activeInfo,
  onClickInfo,
}: SideBarProps) {
  const router = useRouter();
  const clickLogout = () => {
    router.push("/");
  };
  const clickBack = () => {
    router.push("/account");
  };
  return (
    <div className="w-full h-full border-r-2 border-gray-300">
      <div className="w-full h-full flex flex-col justify-between  py-4">
        <div className="w-full flex-1 flex flex-col items-end gap-2 ">
          <div className="w-[16%] h-6">
            <div
              onClick={() => clickBack()}
              className="flex flex-row items-center text-[#2e3e48] font-regular  w-full p-1 cursor-pointer"
            >
              <MdOutlineArrowBack />
            </div>
          </div>
          <div className="w-[90%] h-10">
            <Link
              href={"/domain"}
              className={`flex flex-row items-center gap-4 ${
                activeTab === "domain"
                  ? "text-white bg-[#2e3e48]"
                  : "text-[#2e3e48]"
              } font-regular rounded-bl-lg rounded-tl-lg w-full p-2 `}
            >
              <div
                className={`${
                  activeTab === "domain"
                    ? "bg-[#CAF389] text-[#2e3e48]"
                    : "bg-[#2e3e48] text-white"
                } p-1 rounded-sm`}
              >
                <MdDomainAdd />
              </div>
              <span>Domain</span>
            </Link>
          </div>
          {activeInfo === "info" && activeTab === "domain" && (
            <div className="w-[52%] h-10">
              <div className="flex flex-row items-center gap-4 text-[#2e3e48] bg-[#CAF389] font-regular rounded-bl-lg rounded-tl-lg w-full p-1">
                <div className="p-1 ">
                  <FaCircle className="text-xs" />
                </div>
                <span>Info</span>
                <MdPlayArrow />
              </div>
            </div>
          )}
          {activeInfo === "" &&
            (activeTab === "domain" || activeTab === "campaign") && (
              <div className="pt-1"></div>
            )}

          {/* Analytics Tab */}
          <div className="w-[90%] h-10">
            <Link
              href={"/analytics"}
              className={`flex flex-row items-center gap-4 ${
                activeTab === "analytics"
                  ? "text-white bg-[#2e3e48]"
                  : "text-[#2e3e48]"
              } font-regular rounded-bl-lg rounded-tl-lg w-full p-2 `}
            >
              <div
                className={`${
                  activeTab === "analytics"
                    ? "bg-[#CAF389] text-[#2e3e48]"
                    : "bg-[#2e3e48] text-white"
                } p-1 rounded-sm`}
              >
                <MdBarChart />
              </div>
              <span>Analytics</span>
            </Link>
          </div>

          <div className="w-[90%] h-10">
            <Link
              href={"/campaign"}
              className={`flex flex-row items-center gap-4 ${
                activeTab === "campaign"
                  ? "text-white bg-[#2e3e48]"
                  : "text-[#2e3e48]"
              } font-regular rounded-bl-lg rounded-tl-lg w-full p-2 `}
            >
              <div
                className={`${
                  activeTab === "campaign"
                    ? "bg-[#CAF389] text-[#2e3e48]"
                    : "bg-[#2e3e48] text-white"
                } p-1 rounded-sm`}
              >
                <MdCampaign />
              </div>
              <span>Campaign</span>
            </Link>
          </div>
          {activeInfo === "info" && activeTab === "campaign" && (
            <div className="w-[52%] h-10">
              <div className="flex flex-row items-center gap-4 text-[#2e3e48] bg-[#CAF389] font-regular rounded-bl-lg rounded-tl-lg w-full p-1">
                <div className="p-1 ">
                  <FaCircle className="text-xs" />
                </div>
                <span>Info</span>
                <MdPlayArrow />
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-row items-center justify-center h-10">
          <button
            onClick={() => clickLogout()}
            className="flex flex-row gap-4 
                       text-[#2e3e48]
                   font-regular p-2 rounded-bl-lg rounded-tl-lg h-full"
          >
            <div className="bg-[#2e3e48] text-white p-1 rounded-sm font-bold">
              <IoLogOut />
            </div>
            <span> Logout </span>
          </button>
        </div>
      </div>
    </div>
  );
}
