/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { MdAccountBalance, MdWeb } from "react-icons/md";
import { IoLogOut } from "react-icons/io5";
import { IoPerson } from "react-icons/io5";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { removeToken } from "@/lib/auth";

type SideBarProps = {
  activeTab: string;
  onClickTab: (tab: string) => void;
};

export default function SideBar({ activeTab, onClickTab }: SideBarProps) {
  const router = useRouter();
  const clickLogout = () => {
    removeToken();
    router.push("/");
  };
  return (
    <div className="w-full h-full border-r-2 border-gray-300">
      <div className="w-full h-full flex flex-col justify-between gap-6 py-4">
        <div className="w-full flex-1 flex flex-col items-end gap-4 ">
          <div className="w-[90%] h-10">
            <Link
              href={"/account"}
              className={`flex flex-row items-center gap-4 ${activeTab === "account"
                  ? "text-white bg-[#2e3e48]"
                  : "text-[#2e3e48]"
                } font-regular rounded-bl-lg rounded-tl-lg w-full p-2 `}
            >
              <div
                className={`${activeTab === "account"
                    ? "bg-[#CAF389] text-[#2e3e48]"
                    : "bg-[#2e3e48] text-white"
                  } p-1 rounded-sm`}
              >
                <MdAccountBalance />
              </div>
              <span>Account Home</span>
            </Link>
          </div>
          <div className="w-[90%] h-10">
            <Link
              href={"/website"}
              className={`flex flex-row items-center gap-4 ${activeTab === "website"
                  ? "text-white bg-[#2e3e48]"
                  : "text-[#2e3e48]"
                } font-regular rounded-bl-lg rounded-tl-lg w-full p-2 `}
            >
              <div
                className={`${activeTab === "website"
                    ? "bg-[#CAF389] text-[#2e3e48]"
                    : "bg-[#2e3e48] text-white"
                  } p-1 rounded-sm`}
              >
                <MdWeb />
              </div>
              <span>Website</span>
            </Link>
          </div>
          <div className="w-[90%] h-10">
            <Link
              href={"/profile"}
              className="flex flex-row items-center gap-4 text-[#2e3e48] font-regular rounded-bl-lg rounded-tl-lg w-full p-2"
            >
              <div className="bg-[#2e3e48] text-white p-1 rounded-sm">
                <IoPerson />
              </div>
              <span>Profile</span>
            </Link>
          </div>
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
