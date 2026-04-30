import API from "./api";
import { handleApiError } from "./api_error";

export const registerUser = async (data: any) => {
  try {
    const res = await API.post("/api/user/", data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const loginUser = async (data: any) => {
  try {
    const res = await API.post("/api/user/login", data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const verifyUser = async (data: { email: string; code: string; type: "email" | "phone" }) => {
  try {
    const res = await API.post("/api/user/verify", data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getMe = async () => {
  try {
    const res = await API.get("/api/user/me");
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateMe = async (data: any) => {
  try {
    const res = await API.patch("/api/user/me", data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
