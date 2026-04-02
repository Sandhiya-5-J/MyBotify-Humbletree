import API from "./api";
import { handleApiError } from "./api_error";

export const verifyOtp = async (email: string, code: string) => {
  const data = JSON.stringify({
    email,
    type: "email",
    code,
  });
  try {
    const response = await API.post("/api/user/verify", data, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("verify otp");
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};

export const resendOtp = async (email: string) => {
  const data = JSON.stringify({
    email,
    type: "email_verification",
  });
  try {
    const response = await API.post("/api/user/resend-verification", data, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("resend otp");
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};
