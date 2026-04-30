// utils/handleApiError.ts
import axios from "axios";

export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    let detail = error.response?.data?.detail || error.message || "Something went wrong.";
    if (Array.isArray(detail)) {
      detail = detail.map((err: any) => err.msg || JSON.stringify(err)).join(", ");
    }
    throw new Error(detail);
  }
  throw new Error("Unexpected error. Please try again later.");
};
