import API from "./api";
import { handleApiError } from "./api_error";

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  phone_number: string;
}) => {
  try {
    const response = await API.post("/api/user", payload, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("inside sign up");
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
};
