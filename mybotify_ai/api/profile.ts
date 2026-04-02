import API from "./api";
import { handleApiError } from "./api_error";

/** Get current user profile */
export const getMyProfile = async () => {
    try {
        const res = await API.get("/api/user/me");
        return res.data;
    } catch (error) {
        handleApiError(error);
    }
};

/** Update current user profile */
export const updateMyProfile = async (data: {
    name?: string;
    phone_number?: number;
    current_password?: string;
    new_password?: string;
    confirm_password?: string;
}) => {
    try {
        const res = await API.patch("/api/user/me", data);
        return res.data;
    } catch (error) {
        handleApiError(error);
    }
};
