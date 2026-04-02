/**
 * Auth utilities for managing JWT tokens and authentication state.
 */

const TOKEN_KEY = "mybotify_token";

/** Save JWT to localStorage */
export const setToken = (token: string) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_KEY, token);
    }
};

/** Get JWT from localStorage */
export const getToken = (): string | null => {
    if (typeof window !== "undefined") {
        return localStorage.getItem(TOKEN_KEY);
    }
    return null;
};

/** Remove JWT from localStorage (logout) */
export const removeToken = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
    }
};

/** Check if user is authenticated */
export const isAuthenticated = (): boolean => {
    return !!getToken();
};

/** Decode JWT payload (without verification — just reads data) */
const decodeToken = (): Record<string, string> | null => {
    const token = getToken();
    if (!token) return null;
    try {
        const base64Payload = token.split(".")[1];
        const payload = atob(base64Payload);
        return JSON.parse(payload);
    } catch {
        return null;
    }
};

/** Get user role from JWT */
export const getUserRole = (): string | null => {
    const payload = decodeToken();
    return payload?.role ?? null;
};

/** Get user email from JWT */
export const getUserEmail = (): string | null => {
    const payload = decodeToken();
    return payload?.email ?? null;
};

/** Check if current user is admin */
export const isAdmin = (): boolean => {
    return getUserRole() === "admin";
};
