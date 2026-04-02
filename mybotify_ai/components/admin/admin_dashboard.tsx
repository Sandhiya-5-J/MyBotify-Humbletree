/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, isAdmin } from "@/lib/auth";
import HeaderWithPopovers from "../common/header";
import AdminSidebar from "./admin_sidebar";
import UsersTable from "./users_table";
import AdminStats from "./admin_stats";
import StoresTable from "./stores_table";
import Footer from "../common/footer";
import ChatBar from "@/components/account/common/chat_bar";

export default function AdminDashboard() {
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/");
        } else if (!isAdmin()) {
            router.push("/account");
        } else {
            setAuthChecked(true);
        }
    }, [router]);

    if (!authChecked) {
        return (
            <div className="w-full h-full bg-[#F1F5F2] flex items-center justify-center min-h-screen">
                <p className="text-gray-500 text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-screen bg-[#F1F5F2]">
            <HeaderWithPopovers />
            <div className="flex h-[90%]">
                <div className="w-[14%] h-full">
                    <AdminSidebar activeTab={activeTab} onClickTab={setActiveTab} />
                </div>
                <div className="w-[61%] h-full flex flex-col py-4 px-6 overflow-auto border-r-2 border-gray-300">
                    {activeTab === "dashboard" && <AdminStats />}
                    {activeTab === "users" && <UsersTable />}
                    {activeTab === "stores" && <StoresTable />}
                    <Footer />
                </div>
                <ChatBar addAccountChat={""} isAdminChat={true} />
            </div>
        </div>
    );
}
