import API from "./api";
import { handleApiError } from "./api_error";

/** Get all campaigns for a specific store */
export const getStoreCampaigns = async (storeId: number) => {
  try {
    const res = await API.get(`/api/campaign/store/${storeId}`);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Create a new campaign */
export const createCampaign = async (data: {
  store_id: number;
  name: string;
  platform: string;
  status?: string;
  budget?: number;
  target_audience?: string;
  generated_copy?: string;
  products_targeted?: string;
  ad_creative_url?: string;
}) => {
  try {
    const res = await API.post("/api/campaign/", data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

/** Generate campaign content with AI */
export const generateCampaignContent = async (data: {
  store_id: number;
  platform: string;
  goal?: string;
  target_audience?: string;
  products_context?: string;
}) => {
  try {
    const res = await API.post("/api/campaign/generate", data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
