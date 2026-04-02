// utils/handleApiError.ts
import axios from "axios";

export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail || error.message || "Something went wrong.";
    throw new Error(detail);
  }
  throw new Error("Unexpected error. Please try again later.");
};
