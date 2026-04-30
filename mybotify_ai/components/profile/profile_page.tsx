/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, isAdmin, getUserEmail } from "@/lib/auth";
import { getMyProfile, updateMyProfile } from "@/api/profile";
import HeaderWithPopovers from "../common/header";
import Footer from "../common/footer";
import toast from "react-hot-toast";

export default function ProfilePage() {
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("");

    // Password change
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/");
            return;
        }
        setAuthChecked(true);

        getMyProfile()
            .then((data) => {
                if (data) {
                    setName(data.name || "");
                    setEmail(data.email || "");
                    setPhone(data.phone_number ? String(data.phone_number) : "");
                    setRole(data.role || "user");
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [router]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const data: any = {};
            if (name) data.name = name;
            if (phone) data.phone_number = parseInt(phone);

            await updateMyProfile(data);
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setSaving(true);
        try {
            await updateMyProfile({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });
            toast.success("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error(error.message || "Failed to change password");
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        if (isAdmin()) {
            router.push("/admin");
        } else {
            router.push("/account");
        }
    };

    if (!authChecked || loading) {
        return (
            <div className="w-full h-full bg-[#F1F5F2] flex items-center justify-center min-h-screen">
                <svg className="animate-spin h-8 w-8 text-[#2e3e48]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#F1F5F2]">
            <HeaderWithPopovers />
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={handleBack}
                        className="text-[#2e3e48] hover:bg-gray-200 p-2 rounded-lg text-sm font-medium"
                    >
                        ← Back
                    </button>
                    <h1 className="text-2xl font-bold text-[#2E3E48]">My Profile</h1>
                    <span className="px-3 py-1 bg-[#CAF389] text-[#2e3e48] rounded-full text-xs font-semibold uppercase">
                        {role}
                    </span>
                </div>

                {/* Profile Info */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-bold text-[#2E3E48] mb-4">
                        Profile Information
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2e3e48]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Email cannot be changed
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2e3e48]"
                                placeholder="Enter phone number"
                            />
                        </div>
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="bg-[#2e3e48] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#162120] disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-[#2E3E48] mb-4">
                        Change Password
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2e3e48]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2e3e48]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#2e3e48]"
                            />
                        </div>
                        <button
                            onClick={handleChangePassword}
                            disabled={saving}
                            className="bg-[#2e3e48] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#162120] disabled:opacity-50"
                        >
                            {saving ? "Changing..." : "Change Password"}
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
