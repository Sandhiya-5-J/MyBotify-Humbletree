/**
 * Auth utilities for managing JWT tokens and authentication state.
 */

import Cookies from "js-cookie";

const TOKEN_KEY = "mybotify_token";

/** Save JWT to cookie — expires in 1 day to match backend JWT lifetime */
export const setToken = (token: string) => {
    Cookies.set(TOKEN_KEY, token, { expires: 1, path: '/' });
};

/** Get JWT from cookie */
export const getToken = (): string | null => {
    return Cookies.get(TOKEN_KEY) || null;
};

/** Remove JWT from cookie (logout) */
export const removeToken = () => {
    Cookies.remove(TOKEN_KEY, { path: '/' });
};

/** Decode JWT payload (without verification — just reads data) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const decodeToken = (): Record<string, any> | null => {
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

/** Check if the JWT token has expired by reading its `exp` claim */
export const isTokenExpired = (): boolean => {
    const payload = decodeToken();
    if (!payload?.exp) return true;
    // JWT exp is in seconds, Date.now() is in milliseconds
    return Date.now() >= payload.exp * 1000;
};

/** Check if user is authenticated (token exists AND is not expired) */
export const isAuthenticated = (): boolean => {
    const token = getToken();
    if (!token) return false;
    if (isTokenExpired()) {
        removeToken(); // Clean up stale cookie
        return false;
    }
    return true;
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
