import API from "./api";
import { handleApiError } from "./api_error";

/** Get all users (admin only) */
export const getAllUsers = async () => {
    try {
        const res = await API.get("/api/user/all");
        return res.data;
    } catch (error) {
        handleApiError(error);
    }
};

/** Update a user's role (admin only) */
export const updateUserRole = async (userId: number, role: string) => {
    try {
        const res = await API.patch(`/api/user/${userId}/role`, { role });
        return res.data;
    } catch (error) {
        handleApiError(error);
    }
};

/** Toggle user active/inactive (admin only) */
export const toggleUserActive = async (userId: number, isActive: boolean) => {
    try {
        const res = await API.patch(`/api/user/${userId}/active`, {
            is_active: isActive,
        });
        return res.data;
    } catch (error) {
        handleApiError(error);
    }
};
