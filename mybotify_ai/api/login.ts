import API from "./api";
import { handleApiError } from "./api_error";
import { setToken } from "@/lib/auth";


export const loginUser = async (email: string, password: string) => {
  try {
    const res = await API.post("/api/user/login", { email, password });
    const accessToken = res.data.access_token;

    // Store JWT in localStorage
    setToken(accessToken);

    return { access_token: accessToken };
  } catch (error) {
    handleApiError(error);
  }
};

export const requestResetPassword = async (email: string) => {
  try {
    const response = await API.post("/api/user/reset-password/request", { email });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const confirmResetPassword = async (
  email: string,
  code: string,
  newPassword: string
) => {
  try {
    const response = await API.post("/api/user/reset-password/confirm", {
      email,
      code,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
