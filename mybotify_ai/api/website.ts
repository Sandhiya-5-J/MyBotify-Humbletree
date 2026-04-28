import API from "./api";
import { handleApiError } from "./api_error";

/** Get all websites for the current user */
export const getMyWebsites = async () => {
  try {
    const res = await API.get("/api/website/my-websites");
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Create a new website */
export const createWebsite = async (data: {
  url: string;
  name?: string;
  status?: string;
}) => {
  try {
    const res = await API.post("/api/website/", data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Update a website */
export const updateWebsite = async (
  websiteId: number,
  data: { url?: string; name?: string; status?: string }
) => {
  try {
    const res = await API.put(`/api/website/${websiteId}`, data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Delete a website */
export const deleteWebsite = async (websiteId: number) => {
  try {
    const res = await API.delete(`/api/website/${websiteId}`);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
