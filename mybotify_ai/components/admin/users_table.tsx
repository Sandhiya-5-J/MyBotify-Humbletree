/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { getAllUsers, updateUserRole, toggleUserActive } from "@/api/admin";

export default function UsersTable() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");

    const fetchUsers = () => {
        setLoading(true);
        getAllUsers()
            .then((data) => setUsers(data || []))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            await updateUserRole(userId, newRole);
            fetchUsers();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleToggleActive = async (userId: number, currentActive: boolean) => {
        try {
            await toggleUserActive(userId, !currentActive);
            fetchUsers();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const filteredUsers = users.filter(
        (u) =>
            u.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchValue.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading users...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#2E3E48]">User Management</h2>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm w-64"
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-[#2e3e48] text-white">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">ID</th>
                            <th className="px-4 py-3 text-left font-medium">Name</th>
                            <th className="px-4 py-3 text-left font-medium">Email</th>
                            <th className="px-4 py-3 text-left font-medium">Role</th>
                            <th className="px-4 py-3 text-left font-medium">Status</th>
                            <th className="px-4 py-3 text-left font-medium">Created</th>
                            <th className="px-4 py-3 text-center font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user, idx) => (
                            <tr
                                key={user.id}
                                className={`border-b border-gray-100 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    } hover:bg-[#f8fdf0] transition-colors`}
                            >
                                <td className="px-4 py-3 text-gray-600">{user.id}</td>
                                <td className="px-4 py-3 font-medium text-[#2E3E48]">
                                    {user.name}
                                </td>
                                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                                <td className="px-4 py-3">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="px-2 py-1 border border-gray-300 rounded text-xs font-medium outline-none cursor-pointer"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="moderator">Moderator</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_active
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {user.is_active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => handleToggleActive(user.id, user.is_active)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${user.is_active
                                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                : "bg-green-50 text-green-600 hover:bg-green-100"
                                            }`}
                                    >
                                        {user.is_active ? "Deactivate" : "Activate"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="py-8 text-center text-gray-500">No users found</div>
                )}
            </div>
        </div>
    );
}
