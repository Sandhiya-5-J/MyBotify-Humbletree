"use client";

import { MdDashboard, MdPeople, MdStorefront } from "react-icons/md";
import { IoPerson, IoLogOut } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";

type SideBarProps = {
    activeTab: string;
    onClickTab: (tab: string) => void;
};

export default function AdminSidebar({ activeTab, onClickTab }: SideBarProps) {
    const router = useRouter();

    const clickLogout = () => {
        removeToken();
        router.push("/");
    };

    const tabs = [
        { key: "dashboard", label: "Dashboard", icon: <MdDashboard /> },
        { key: "users", label: "Users", icon: <MdPeople /> },
        { key: "stores", label: "Stores", icon: <MdStorefront /> },
    ];

    return (
        <div className="w-full h-full border-r-2 border-gray-300">
            <div className="w-full h-full flex flex-col justify-between gap-6 py-4">
                <div className="w-full flex-1 flex flex-col items-end gap-4">
                    {tabs.map((tab) => (
                        <div key={tab.key} className="w-[90%] h-10">
                            <button
                                onClick={() => onClickTab(tab.key)}
                                className={`flex flex-row items-center gap-4 ${activeTab === tab.key
                                    ? "text-white bg-[#2e3e48]"
                                    : "text-[#2e3e48]"
                                    } font-regular rounded-bl-lg rounded-tl-lg w-full p-2`}
                            >
                                <div
                                    className={`${activeTab === tab.key
                                        ? "bg-[#CAF389] text-[#2e3e48]"
                                        : "bg-[#2e3e48] text-white"
                                        } p-1 rounded-sm`}
                                >
                                    {tab.icon}
                                </div>
                                <span>{tab.label}</span>
                            </button>
                        </div>
                    ))}
                    <div className="w-[90%] h-10">
                        <button
                            onClick={() => router.push("/profile")}
                            className={`flex flex-row items-center gap-4 text-[#2e3e48] font-regular rounded-bl-lg rounded-tl-lg w-full p-2`}
                        >
                            <div className="bg-[#2e3e48] text-white p-1 rounded-sm">
                                <IoPerson />
                            </div>
                            <span>Profile</span>
                        </button>
                    </div>
                </div>
                <div className="flex flex-row items-center justify-center h-10">
                    <button
                        onClick={clickLogout}
                        className="flex flex-row gap-4 text-[#2e3e48] font-regular p-2 rounded-bl-lg rounded-tl-lg h-full"
                    >
                        <div className="bg-[#2e3e48] text-white p-1 rounded-sm font-bold">
                            <IoLogOut />
                        </div>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
